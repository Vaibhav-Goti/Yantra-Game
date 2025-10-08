import moment from 'moment';
import { calculateTimeDifference, isTimeBetween } from './timeUtils.js';

/**
 * Calculate game duration in seconds
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Duration in seconds
 */
export const calculateGameDuration = (startTime, endTime) => {
    const duration = calculateTimeDifference(startTime, endTime);
    return Math.abs(duration.seconds);
};

/**
 * Find timeframes that cover the game duration
 * @param {Array} timeFrames - Array of timeframe objects
 * @param {string} startTime - Game start time
 * @param {string} endTime - Game end time
 * @returns {Array} Array of relevant timeframes
 */
export const findRelevantTimeFrames = (timeFrames, startTime, endTime) => {
    if (!Array.isArray(timeFrames) || timeFrames.length === 0) {
        return [];
    }

    const startMoment = moment(startTime, 'HH:mm', true);
    const endMoment = moment(endTime, 'HH:mm', true);

    if (!startMoment.isValid() || !endMoment.isValid()) {
        throw new Error('Invalid time format');
    }

    return timeFrames.filter(timeframe => {
        const timeframeMoment = moment(timeframe.time, 'HH:mm', true);
        return timeframeMoment.isBetween(startMoment, endMoment, null, '[]') ||
            timeframeMoment.isSame(startMoment) ||
            timeframeMoment.isSame(endMoment);
    });
};

/**
 * Calculate deduction percentage for game duration
 * @param {Array} relevantTimeFrames - Timeframes that cover the game
 * @param {string} startTime - Game start time
 * @param {string} endTime - Game end time
 * @returns {Object} Deduction calculation result
 */
export const calculateDeduction = (relevantTimeFrames, startTime, endTime) => {
    if (!Array.isArray(relevantTimeFrames) || relevantTimeFrames.length === 0) {
        return {
            totalDeductionPercentage: 0,
            timeFrameDeductions: []
        };
    }

    let totalDeductionPercentage = 0;
    const timeFrameDeductions = [];

    relevantTimeFrames.forEach(timeframe => {
        // Calculate how much of this timeframe is covered by the game
        const timeframeStart = moment(timeframe.time, 'HH:mm', true);
        const gameStart = moment(startTime, 'HH:mm', true);
        const gameEnd = moment(endTime, 'HH:mm', true);

        // Calculate overlap percentage
        let overlapPercentage = 0;

        if (timeframeStart.isBetween(gameStart, gameEnd, null, '[]')) {
            // Full timeframe is within game duration
            overlapPercentage = 100;
        } else if (timeframeStart.isSame(gameStart) || timeframeStart.isSame(gameEnd)) {
            // Partial overlap
            overlapPercentage = 50; // Simplified calculation
        }

        const deductionForTimeFrame = (timeframe.percentage * overlapPercentage) / 100;
        totalDeductionPercentage += deductionForTimeFrame;

        timeFrameDeductions.push({
            timeframeId: timeframe._id,
            time: timeframe.time,
            originalPercentage: timeframe.percentage,
            overlapPercentage,
            deductionPercentage: deductionForTimeFrame
        });
    });

    return {
        totalDeductionPercentage: Math.min(totalDeductionPercentage, 100), // Cap at 100%
        timeFrameDeductions
    };
};

/**
 * Calculate final amounts after deduction
 * @param {Array} buttonPresses - Array of button press data
 * @param {number} totalDeductionPercentage - Total deduction percentage
 * @param {number} amountPerPress - Amount per button press (default: 10)
 * @returns {Array} Array with calculated amounts
 */
export const calculateFinalAmounts = (buttonPresses, totalDeductionPercentage, amountPerPress = 10) => {
    const totalBetAmount = buttonPresses.reduce((sum, press) => {
        return sum + (press.pressCount * amountPerPress);
    }, 0);

    const totalDeductedAmount = (totalBetAmount * totalDeductionPercentage) / 100;
    const finalAmount = totalBetAmount - totalDeductedAmount;

    const buttonResults = buttonPresses.map(press => {
        const buttonAmount = press.pressCount * amountPerPress;
        const payOutAmount = press.pressCount * 100;

        return {
            buttonNumber: press.buttonNumber,
            pressCount: press.pressCount,
            totalAmount: buttonAmount,
            payOutAmount,
            finalAmount: buttonAmount // No deduction per button - only from overall amount
        };
    });

    return {
        totalBetAmount,
        totalDeductedAmount,
        finalAmount,
        buttonResults
    };
};

/**
 * Determine winners based on final amounts
 * @param {Array} buttonResults - Array of button results
 * @param {number} finalAmount - Total final amount available
 * @returns {Array} Array of winners
 */

// sort funtion
function shuffle(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}


// export const determineWinners = (buttonResults, finalAmount) => {
//     if (!Array.isArray(buttonResults) || buttonResults.length === 0) {
//         return [];
//     }

//     // Sort buttons by final amount (highest first)
//     const sortedButtons = [...buttonResults].sort((a, b) => b.finalAmount - a.finalAmount);

//     const winners = [];
//     let remainingAmount = finalAmount;

//     for (const button of sortedButtons) {
//         if (button.payOutAmount > 0 && button.payOutAmount <= remainingAmount) {
//             // Button can win the full amount
//             winners.push({
//                 buttonNumber: button.buttonNumber,
//                 amount: button.finalAmount,
//                 payOutAmount: button.payOutAmount,
//                 isWinner: true
//             });
//             remainingAmount -= button.payOutAmount;
//         } else {
//             // Button doesn't win (either 0 amount or not enough money left)
//             winners.push({
//                 buttonNumber: button.buttonNumber,
//                 amount: 0,
//                 payOutAmount: button.payOutAmount,
//                 isWinner: false
//             });
//         }
//     }

//     return winners;
// };

// export const determineWinners = (buttonResults, finalAmount) => {
//     if (!Array.isArray(buttonResults) || buttonResults.length === 0) {
//         return { winners: [], unusedAmount: finalAmount, totalAdded: 0 };
//     }

//     // Group by payOutAmount
//     const grouped = {};
//     for (const b of buttonResults) {
//         if (!grouped[b.payOutAmount]) grouped[b.payOutAmount] = [];
//         grouped[b.payOutAmount].push(b);
//     }

//     // // Sort payout amounts high → low, shuffle inside each group
//     const sortedPayouts = Object.keys(grouped)
//         .map(Number)
//         .sort((a, b) => b - a);

//     // Flatten buttons into one list, shuffle inside equal groups
//     const sortedButtons = sortedPayouts.flatMap(payout => {
//         const group = grouped[payout];
//         for (let i = group.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [group[i], group[j]] = [group[j], group[i]];
//         }
//         return group;
//     });

//     const winners = [];
//     let remainingAmount = finalAmount;
//     let totalAdded = 0;
//     let winnerWithZeroPress = false;
//     const MAX_TOP_UP = 50;

//     for (const button of sortedButtons) {
//         if (button.payOutAmount > 0) {
//             if (button.payOutAmount <= remainingAmount) {
//                 // Full pay
//                 winners.push({
//                     buttonNumber: button.buttonNumber,
//                     amount: button.finalAmount,
//                     payOutAmount: button.payOutAmount,
//                     isWinner: true
//                 });
//                 remainingAmount -= button.payOutAmount;

//             } else {
//                 const shortfall = button.payOutAmount - remainingAmount;
//                 if (remainingAmount > 0 && shortfall <= MAX_TOP_UP) {
//                     // Pay with top-up
//                     winners.push({
//                         buttonNumber: button.buttonNumber,
//                         amount: button.finalAmount,
//                         payOutAmount: button.payOutAmount,
//                         isWinner: true
//                     });
//                     totalAdded += shortfall;
//                     remainingAmount = 0;
//                 } else {
//                     // Cannot pay
//                     winners.push({
//                         buttonNumber: button.buttonNumber,
//                         amount: 0,
//                         payOutAmount: button.payOutAmount,
//                         isWinner: false
//                     });
//                 }
//             }
//         } else if (button.pressCount >= 1) {
//             // Fallback: any pressed button with 0 payOutAmount becomes a winner
//             winners.push({
//                 buttonNumber: button.buttonNumber,
//                 amount: button.finalAmount, // or 1 if you want minimal
//                 payOutAmount: button.payOutAmount,
//                 isWinner: true
//             });
//             winnerWithZeroPress = true;
//         }
//     }

//     if (!winners.some(w => w.isWinner)) {
//         let fallbackButton;

//         // Pick a random button with 0 presses
//         const zeroPressButtons = buttonResults.filter(b => b.pressCount === 0);
//         if (zeroPressButtons.length > 0) {
//             fallbackButton = zeroPressButtons[Math.floor(Math.random() * zeroPressButtons.length)];
//         }

//         if (fallbackButton) {
//             winners.push({
//                 buttonNumber: fallbackButton.buttonNumber,
//                 amount: fallbackButton.finalAmount,
//                 payOutAmount: fallbackButton.payOutAmount,
//                 isWinner: true
//             });
//             remainingAmount = Math.max(0, remainingAmount - fallbackButton.payOutAmount);
//         }
//     }

//     // Ensure remainingAmount never negative due to fallback
//     if (remainingAmount < 0) remainingAmount = 0;

//     return { winners, unusedAmount: remainingAmount, totalAdded: totalAdded, winnerWithZeroPress };
// };

export const determineWinners = (buttonResults, finalAmount, totalBetAmount, maxWinners = 1, isJackpotWinner = false) => {
    if (!Array.isArray(buttonResults) || buttonResults.length === 0) {
        return { winners: [], unusedAmount: finalAmount, totalAdded: 0 };
    }

    // Group by payOutAmount
    // const grouped = {};
    // for (const b of buttonResults) {
    //     if (!grouped[b.payOutAmount]) grouped[b.payOutAmount] = [];
    //     grouped[b.payOutAmount].push(b);
    // }

    // // Sort payout amounts high → low, shuffle inside each group
    // const sortedPayouts = Object.keys(grouped)
    //     .map(Number)
    //     .sort((a, b) => b - a);

    // const sortedButtons = sortedPayouts.flatMap(payout => {
    //     const group = grouped[payout];
    //     for (let i = group.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));
    //         [group[i], group[j]] = [group[j], group[i]];
    //     }
    //     return group;
    // });

    // const shuffledButtons = [...buttonResults];
    // for (let i = shuffledButtons.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [shuffledButtons[i], shuffledButtons[j]] = [shuffledButtons[j], shuffledButtons[i]];
    // }

    const buttonResultsAfterWinnerRule = buttonResults.some(b => b.eligibleForWin) ? buttonResults.filter(b => b.eligibleForWin) : buttonResults;

    function timeMixedShuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const random = (Math.random() + (performance.now() % 1)) % 1;
            const j = Math.floor(random * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    const shuffledButtons = timeMixedShuffle([...buttonResultsAfterWinnerRule]);

    const winners = [];
    let remainingAmount = finalAmount;
    let totalAdded = 0;
    let winnerWithZeroPress = false;
    const MAX_TOP_UP = 50;
    let jackpotCount = 0;
    let totalBetAmountFromMachine = totalBetAmount;
    let isManualWin = false;

    // --- Jackpot logic ---
    if (isJackpotWinner) {
        const jackpotButtons = timeMixedShuffle([...buttonResults]);
        const winners = [];
        let remainingAmount = finalAmount;
        let totalAdded = 0;
        let jackpotCount = 0;
        const MAX_TOP_UP = 50; // your allowed top-up limit

        // Step 1: Try to fill winners normally (affordable payouts)
        for (const button of jackpotButtons) {
            if (jackpotCount >= maxWinners) break;

            if (button.payOutAmount > 0) {
                if (button.payOutAmount <= remainingAmount) {
                    winners.push({
                        buttonNumber: button.buttonNumber,
                        amount: button.buttonAmount,
                        payOutAmount: button.payOutAmount,
                        isWinner: true,
                        winnerType: 'jackpot'
                    });
                    remainingAmount -= button.payOutAmount;
                    jackpotCount++;
                } else {
                    const shortfall = button.payOutAmount - remainingAmount;
                    if (remainingAmount > 0 && shortfall <= MAX_TOP_UP) {
                        winners.push({
                            buttonNumber: button.buttonNumber,
                            amount: button.buttonAmount,
                            payOutAmount: button.payOutAmount,
                            isWinner: true,
                            winnerType: 'jackpot'
                        });
                        totalAdded += shortfall;
                        remainingAmount = 0;
                        jackpotCount++;
                    }
                }
            } else if (button.pressCount >= 1 && jackpotCount < maxWinners) {
                winners.push({
                    buttonNumber: button.buttonNumber,
                    amount: button.buttonAmount,
                    payOutAmount: 0,
                    isWinner: true,
                    winnerType: 'jackpot'
                });
                jackpotCount++;
            }
        }

        // Step 2: Fallback — choose minimal-loss button if we still need more winners
        if (jackpotCount < maxWinners) {
            const remainingWinnersNeeded = maxWinners - jackpotCount;

            // Filter buttons not already chosen
            const nonWinners = jackpotButtons.filter(
                b => !winners.some(w => w.buttonNumber === b.buttonNumber)
            );

            // Sort remaining by minimal payout (to minimize loss)
            const sortedByMinimalLoss = nonWinners.sort((a, b) => a.payOutAmount - b.payOutAmount);

            for (let i = 0; i < remainingWinnersNeeded && i < sortedByMinimalLoss.length; i++) {
                const button = sortedByMinimalLoss[i];
                winners.push({
                    buttonNumber: button.buttonNumber,
                    amount: button.buttonAmount,
                    payOutAmount: button.payOutAmount,
                    isWinner: true,
                    winnerType: 'jackpot',
                    note: 'minimal loss fallback'
                });
                // If payout exceeds remainingAmount, count as loss
                if (button.payOutAmount > remainingAmount) {
                    totalAdded += (button.payOutAmount - remainingAmount);
                    remainingAmount = 0;
                } else {
                    remainingAmount -= button.payOutAmount;
                }
                jackpotCount++;
            }
        }

        remainingAmount = Math.max(0, remainingAmount);
        return { winners, unusedAmount: remainingAmount, totalAdded };
    }

    for (const button of shuffledButtons) {
        if (winners.length >= maxWinners && !button.manualWin) break;

        if (button.manualWin && button.payOutAmount > 0) {
            isManualWin = true;
            winners.push({
                buttonNumber: button.buttonNumber,
                amount: button.finalAmount,
                payOutAmount: button.payOutAmount,
                isWinner: true,
                winnerType: 'manual'
            });
            // Track extra needed if pool is less than payout

            // ✅ Only use positive available pool
            const availablePool = Math.max(0, totalBetAmountFromMachine);

            const extraNeeded = Math.max(0, button.payOutAmount - availablePool);

            // Deduct payout from available pool first
            totalBetAmountFromMachine = Math.max(0, totalBetAmountFromMachine - button.payOutAmount);

            totalAdded += extraNeeded; // track only real extra
            remainingAmount = Math.max(0, totalBetAmountFromMachine);
            continue; // skip normal checks
        }

        // Only consider buttons with payOutAmount > 0 or pressed at least once
        if (button.payOutAmount > 0) {
            if (button.payOutAmount <= remainingAmount) {
                winners.push({
                    buttonNumber: button.buttonNumber,
                    amount: button.finalAmount,
                    payOutAmount: button.payOutAmount,
                    isWinner: true,
                    winnerType: 'regular'
                });
                remainingAmount -= button.payOutAmount;
            } else {
                const shortfall = button.payOutAmount - remainingAmount;
                if (remainingAmount > 0 && shortfall <= MAX_TOP_UP) {
                    winners.push({
                        buttonNumber: button.buttonNumber,
                        amount: button.finalAmount,
                        payOutAmount: button.payOutAmount,
                        isWinner: true,
                        winnerType: 'regular'
                    });
                    totalAdded += shortfall;
                    remainingAmount = 0;
                }
                // If cannot pay, skip this button
            }
        } else if (button.pressCount >= 1) {
            winners.push({
                buttonNumber: button.buttonNumber,
                amount: button.finalAmount,
                payOutAmount: button.payOutAmount,
                isWinner: true,
                winnerType: 'regular'
            });
            winnerWithZeroPress = true;
        }
    }

    // Fallback in rare case: no winners or still below maxWinners
    if (winners.length < maxWinners) {
        const zeroPressButtons = buttonResults.filter(b => b.pressCount === 0 && !winners.some(w => w.buttonNumber === b.buttonNumber));
        if (zeroPressButtons.length > 0) {
            const fallbackButton = zeroPressButtons[Math.floor(Math.random() * zeroPressButtons.length)];
            winners.push({
                buttonNumber: fallbackButton.buttonNumber,
                amount: fallbackButton.finalAmount,
                payOutAmount: fallbackButton.payOutAmount,
                isWinner: true,
                winnerType: 'regular'
            });
            winnerWithZeroPress = true;
        }
    }

    // Ensure remainingAmount never negative
    remainingAmount = Math.max(0, remainingAmount);

    return { winners, unusedAmount: remainingAmount, totalAdded, winnerWithZeroPress, isManualWin };
};

// export const determineWinners = (buttonResults, finalAmount) => {
//     if (!Array.isArray(buttonResults) || buttonResults.length === 0) {
//         return [];
//     }

//     // Work in whole rupees to avoid floating point issues
//     let remaining = Math.max(0, Math.floor(finalAmount));

//     // Candidates are buttons with positive amount potential
//     const candidates = buttonResults.filter(b => (b?.finalAmount || 0) > 0);

//     // If no candidates or no money, return all zeros
//     if (candidates.length === 0 || remaining === 0) {
//         return buttonResults.map(b => ({
//             buttonNumber: b.buttonNumber,
//             amount: 0,
//             isWinner: false
//         }));
//     }

//     // Randomly shuffle candidates
//     const shuffled = [...candidates].sort(() => Math.random() - 0.5);

//     // Choose at least 2 winners when possible
//     const minWinners = Math.min(2, shuffled.length);
//     let selected = shuffled.slice(0, Math.max(minWinners, 2));

//     // Helper: compute capacities per selected (cap = button.finalAmount)
//     const caps = new Map(selected.map(b => [b.buttonNumber, Math.floor(b.finalAmount)]));
//     const allocation = new Map(selected.map(b => [b.buttonNumber, 0]));

//     // If total caps of selected less than remaining, pull in more winners until we can consume remaining or exhaust candidates
//     let selectedSet = new Set(selected.map(b => b.buttonNumber));
//     let idx = selected.length;
//     while ([...caps.values()].reduce((s, v) => s + v, 0) < remaining && idx < shuffled.length) {
//         const next = shuffled[idx++];
//         if (!selectedSet.has(next.buttonNumber)) {
//             selected.push(next);
//             selectedSet.add(next.buttonNumber);
//             caps.set(next.buttonNumber, Math.floor(next.finalAmount));
//             allocation.set(next.buttonNumber, 0);
//         }
//     }

//     // Allocate proportionally first (based on caps), then fix remainder to hit exactly remaining
//     const totalCap = [...caps.values()].reduce((s, v) => s + v, 0);
//     if (totalCap === 0) {
//         // No capacity to allocate
//         return buttonResults.map(b => ({ buttonNumber: b.buttonNumber, amount: 0, isWinner: false }));
//     }

//     // Initial proportional allocation (floored)
//     for (const b of selected) {
//         const cap = caps.get(b.buttonNumber) || 0;
//         const share = Math.floor((cap / totalCap) * remaining);
//         const alloc = Math.min(share, cap);
//         allocation.set(b.buttonNumber, alloc);
//     }

//     // Fix rounding remainder to ensure exact sum equals remaining
//     let allocatedSum = [...allocation.values()].reduce((s, v) => s + v, 0);
//     let leftover = remaining - allocatedSum;

//     // Distribute leftover 1 by 1 to any with remaining capacity, in random order
//     const selectedRandom = [...selected].sort(() => Math.random() - 0.5);
//     let safety = 100000; // safety to avoid infinite loops
//     while (leftover > 0 && safety-- > 0) {
//         let progressed = false;
//         for (const b of selectedRandom) {
//             if (leftover <= 0) break;
//             const cap = caps.get(b.buttonNumber) || 0;
//             const current = allocation.get(b.buttonNumber) || 0;
//             if (current < cap) {
//                 allocation.set(b.buttonNumber, current + 1);
//                 leftover -= 1;
//                 progressed = true;
//             }
//         }
//         if (!progressed) break; // no capacity left among selected
//     }

//     // If still leftover but there are more candidates with capacity, add them and continue
//     idx = selected.length;
//     while (leftover > 0 && idx < shuffled.length && safety-- > 0) {
//         const next = shuffled[idx++];
//         if (!selectedSet.has(next.buttonNumber) && next.finalAmount > 0) {
//             selected.push(next);
//             selectedSet.add(next.buttonNumber);
//             const cap = Math.floor(next.finalAmount);
//             caps.set(next.buttonNumber, cap);
//             allocation.set(next.buttonNumber, 0);

//             // Fill this new candidate as much as possible
//             const fill = Math.min(cap, leftover);
//             allocation.set(next.buttonNumber, fill);
//             leftover -= fill;
//         }
//     }

//     // Final fallback: if leftover still remains and no capacity, push remainder to first selected to guarantee 0 remainder
//     if (leftover > 0 && selected.length > 0) {
//         const first = selected[0];
//         allocation.set(first.buttonNumber, (allocation.get(first.buttonNumber) || 0) + leftover);
//         leftover = 0;
//     }

//     // Build winners array for all buttons (non-selected => 0)
//     const selectedButtons = new Set(selected.map(b => b.buttonNumber));
//     const winners = buttonResults.map(b => {
//         if (selectedButtons.has(b.buttonNumber)) {
//             return {
//                 buttonNumber: b.buttonNumber,
//                 amount: allocation.get(b.buttonNumber) || 0,
//                 isWinner: (allocation.get(b.buttonNumber) || 0) > 0
//             };
//         }
//         return { buttonNumber: b.buttonNumber, amount: 0, isWinner: false };
//     });

//     return winners;
// };

// export const determineWinners = (buttonResults, finalAmount) => {
//     if (!Array.isArray(buttonResults) || buttonResults.length === 0) {
//         return [];
//     }

//     // Work in whole rupees to avoid floating point issues
//     let remaining = Math.max(0, Math.floor(finalAmount));

//     // Candidates are buttons with positive amount potential
//     const candidates = buttonResults.filter(b => (b?.finalAmount || 0) > 0);

//     // If no candidates or no money, return all zeros
//     if (candidates.length === 0 || remaining === 0) {
//         return buttonResults.map(b => ({
//             buttonNumber: b.buttonNumber,
//             amount: 0,
//             isWinner: false
//         }));
//     }

//     // Randomly shuffle candidates
//     const shuffled = [...candidates].sort(() => Math.random() - 0.5);

//     // Choose at least 2 winners when possible
//     const minWinners = Math.min(2, shuffled.length);
//     let selected = shuffled.slice(0, Math.max(minWinners, 2));

//     // Helper: compute capacities per selected (cap = button.finalAmount)
//     const caps = new Map(selected.map(b => [b.buttonNumber, Math.floor(b.finalAmount)]));
//     const allocation = new Map(selected.map(b => [b.buttonNumber, 0]));

//     // If total caps of selected less than remaining, pull in more winners until we can consume remaining or exhaust candidates
//     let selectedSet = new Set(selected.map(b => b.buttonNumber));
//     let idx = selected.length;
//     while ([...caps.values()].reduce((s, v) => s + v, 0) < remaining && idx < shuffled.length) {
//         const next = shuffled[idx++];
//         if (!selectedSet.has(next.buttonNumber)) {
//             selected.push(next);
//             selectedSet.add(next.buttonNumber);
//             caps.set(next.buttonNumber, Math.floor(next.finalAmount));
//             allocation.set(next.buttonNumber, 0);
//         }
//     }

//     // Allocate proportionally first (based on caps), then fix remainder to hit exactly remaining
//     const totalCap = [...caps.values()].reduce((s, v) => s + v, 0);
//     if (totalCap === 0) {
//         // No capacity to allocate
//         return buttonResults.map(b => ({ buttonNumber: b.buttonNumber, amount: 0, isWinner: false }));
//     }

//     // Initial proportional allocation (floored)
//     for (const b of selected) {
//         const cap = caps.get(b.buttonNumber) || 0;
//         const share = Math.floor((cap / totalCap) * remaining);
//         const alloc = Math.min(share, cap);
//         allocation.set(b.buttonNumber, alloc);
//     }

//     // Fix rounding remainder to ensure exact sum equals remaining
//     let allocatedSum = [...allocation.values()].reduce((s, v) => s + v, 0);
//     let leftover = remaining - allocatedSum;

//     // Distribute leftover 1 by 1 to any with remaining capacity, in random order
//     const selectedRandom = [...selected].sort(() => Math.random() - 0.5);
//     let safety = 100000; // safety to avoid infinite loops
//     while (leftover > 0 && safety-- > 0) {
//         let progressed = false;
//         for (const b of selectedRandom) {
//             if (leftover <= 0) break;
//             const cap = caps.get(b.buttonNumber) || 0;
//             const current = allocation.get(b.buttonNumber) || 0;
//             if (current < cap) {
//                 allocation.set(b.buttonNumber, current + 1);
//                 leftover -= 1;
//                 progressed = true;
//             }
//         }
//         if (!progressed) break; // no capacity left among selected
//     }

//     // If still leftover but there are more candidates with capacity, add them and continue
//     idx = selected.length;
//     while (leftover > 0 && idx < shuffled.length && safety-- > 0) {
//         const next = shuffled[idx++];
//         if (!selectedSet.has(next.buttonNumber) && next.finalAmount > 0) {
//             selected.push(next);
//             selectedSet.add(next.buttonNumber);
//             const cap = Math.floor(next.finalAmount);
//             caps.set(next.buttonNumber, cap);
//             allocation.set(next.buttonNumber, 0);

//             // Fill this new candidate as much as possible
//             const fill = Math.min(cap, leftover);
//             allocation.set(next.buttonNumber, fill);
//             leftover -= fill;
//         }
//     }

//     // Final fallback: if leftover still remains and no capacity, push remainder to first selected to guarantee 0 remainder
//     if (leftover > 0 && selected.length > 0) {
//         const first = selected[0];
//         allocation.set(first.buttonNumber, (allocation.get(first.buttonNumber) || 0) + leftover);
//         leftover = 0;
//     }

//     // Build winners array for all buttons (non-selected => 0)
//     const selectedButtons = new Set(selected.map(b => b.buttonNumber));
//     const winners = buttonResults.map(b => {
//         if (selectedButtons.has(b.buttonNumber)) {
//             return {
//                 buttonNumber: b.buttonNumber,
//                 amount: allocation.get(b.buttonNumber) || 0,
//                 isWinner: (allocation.get(b.buttonNumber) || 0) > 0
//             };
//         }
//         return { buttonNumber: b.buttonNumber, amount: 0, isWinner: false };
//     });

//     return winners;
// };

/**
 * Validate game session data
 * @param {Object} sessionData - Game session data
 * @returns {Object} Validation result
 */
export const validateGameSession = (sessionData) => {
    const errors = [];

    // Validate stop time
    // const stopTime = moment(sessionData.stopTime, 'HH:mm', true);

    // if (!stopTime.isValid()) {
    //     errors.push('Invalid stop time format');
    // }

    // Validate button presses
    if (!Array.isArray(sessionData.buttonPresses) || sessionData.buttonPresses.length === 0) {
        errors.push('At least one button must be provided');
    }

    // Validate unique button numbers
    const buttonNumbers = sessionData.buttonPresses?.map(press => press.buttonNumber) || [];
    const uniqueButtonNumbers = [...new Set(buttonNumbers)];
    if (buttonNumbers.length !== uniqueButtonNumbers.length) {
        errors.push('Button numbers must be unique');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Generate unique session ID
 * @returns {string} Unique session ID
 */
export const generateSessionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `GS_${timestamp}_${random}`.toUpperCase();
};
