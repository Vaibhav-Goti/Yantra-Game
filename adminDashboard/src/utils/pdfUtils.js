import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateTime } from './timeUtils';

export const generateTransactionHistoryPDF = (transactions, machines, selectedMachine) => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');

    // ---------- Title ----------
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Machine Transaction History', 14, 15);

    // ---------- Date ----------
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // ---------- Filter ----------
    if (selectedMachine) {
        const machine = machines.find(m => m._id === selectedMachine);
        pdf.text(`Filtered by: ${machine ? machine.machineName : 'Unknown Machine'}`, 14, 28);
    }

    // ---------- Table Data ----------
    const tableData = transactions.map(t => [
        formatDateTime(t.createdAt),
        t?.machineId?.machineName || 'Unknown',
        t.addedAmountToMachine > 0 ? `+Rs.${(Number(t.addedAmountToMachine) || 0).toFixed(2)}` : 'Rs.0.00',
        t.withdrawnAmountFromMachine > 0 ? `-Rs.${(Number(t.withdrawnAmountFromMachine) || 0).toFixed(2)}` : 'Rs.0.00',
        t.payoutAmount > 0 ? `-Rs.${(Number(t.payoutAmount) || 0).toFixed(2)}` : 'Rs.0.00',
        `Rs.${(Number(t.totalBetAmount) || 0).toFixed(2)}`,
        `Rs.${(Number(t.finalAmount) || 0).toFixed(2)}`,
        `Rs.${(Number(t.deductedAmount) || 0).toFixed(2)}`,
        `Rs.${(Number(t.unusedAmount) || 0).toFixed(2)}`,
        `Rs.${(Number(t.totalAdded) || 0).toFixed(2)}`,
        `Rs.${(Number(t.percentageDeducted) || 0).toFixed(1)}`,
        `Rs.${(Number(t.remainingBalance) || 0).toFixed(2)}`,
        t.note || '-'
    ]);

    const columns = [
        'Date & Time', 'Machine', 'Added Amount', 'Withdrawn Amount', 'Payout Amount',
        'Total Bet', 'Final Amount', 'Deducted', 'Unused', 'Total Added', 'Percentage', 'Balance', 'Note'
    ];

    // ---------- Table ----------
    autoTable(pdf, {
        head: [columns],
        body: tableData,
        startY: selectedMachine ? 35 : 30,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            overflow: 'linebreak' // wrap long text
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: {
            0: { halign: 'left' }, // Date
            1: { halign: 'left' }, // Machine
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' },
            8: { halign: 'right' },
            9: { halign: 'right' },
            10: { halign: 'center' },
            11: { halign: 'right' },
            12: { halign: 'left', overflow: 'linebreak' } // Notes column wraps text
        },
        margin: { top: 30, left: 8, right: 8, bottom: 20 },
        tableWidth: 'auto',
        showHead: 'everyPage',
        didDrawPage: function () {
            const pageNumber = pdf.internal.getCurrentPageInfo().pageNumber;
            pdf.setFontSize(8);
            pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.width - 20, pdf.internal.pageSize.height - 10);
        }
    });

    // ---------- Summary ----------
    const finalY = pdf.lastAutoTable.finalY + 5;
    const totals = {
        added: transactions.reduce((a, t) => a + (Number(t.addedAmountToMachine) || 0), 0),
        withdrawn: transactions.reduce((a, t) => a + (Number(t.withdrawnAmountFromMachine) || 0), 0),
        payout: transactions.reduce((a, t) => a + (Number(t.payoutAmount) || 0), 0),
        bet: transactions.reduce((a, t) => a + (Number(t.totalBetAmount) || 0), 0),
        final: transactions.reduce((a, t) => a + (Number(t.finalAmount) || 0), 0),
        deducted: transactions.reduce((a, t) => a + (Number(t.deductedAmount) || 0), 0),
        unused: transactions.reduce((a, t) => a + (Number(t.unusedAmount) || 0), 0),
        totalAdded: transactions.reduce((a, t) => a + (Number(t.totalAdded) || 0), 0),
        machineBalance: transactions.reduce((a, t) => a + (Number(t.remainingBalance) || 0), 0),
        count: transactions.length
    };

    // Check if there's enough space for summary on current page
    const pageHeight = pdf.internal.pageSize.height;
    const requiredSpace = 40; // Approximate space needed for summary

    if (finalY + requiredSpace > pageHeight - 20) {
        // Add a new page if not enough space
        pdf.addPage();
        const newFinalY = 20;

        autoTable(pdf, {
            body: [
                ['Total Added', `Rs.${totals.added.toFixed(2)}`],
                ['Total Withdrawn', `Rs.${totals.withdrawn.toFixed(2)}`],
                ['Total Payout', `Rs.${totals.payout.toFixed(2)}`],
                ['Total Bet', `Rs.${totals.bet.toFixed(2)}`],
                ['Total Final', `Rs.${totals.final.toFixed(2)}`],
                ['Total Deducted', `Rs.${totals.deducted.toFixed(2)}`],
                ['Total Unused', `Rs.${totals.unused.toFixed(2)}`],
                ['Total From Machine', `Rs.${totals.totalAdded.toFixed(2)}`],
                ['Machine Balance', `Rs.${totals.machineBalance.toFixed(2)}`],
                ['Transactions Count', totals.count.toString()]
            ],
            startY: newFinalY,
            styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
                // remove fixed widths, just align
                0: { halign: 'left', fontStyle: 'bold' },
                1: { halign: 'right' }
            },
            margin: { left: 8, right: 8, top: 30, bottom: 20 },
            tableWidth: 'auto'
        });
    } else {
        // Summary section on same page
        autoTable(pdf, {
            body: [
                ['Total Added', `Rs.${totals.added.toFixed(2)}`],
                ['Total Withdrawn', `Rs.${totals.withdrawn.toFixed(2)}`],
                ['Total Payout', `Rs.${totals.payout.toFixed(2)}`],
                ['Total Bet', `Rs.${totals.bet.toFixed(2)}`],
                ['Total Final', `Rs.${totals.final.toFixed(2)}`],
                ['Total Deducted', `Rs.${totals.deducted.toFixed(2)}`],
                ['Total Unused', `Rs.${totals.unused.toFixed(2)}`],
                ['Total From Machine', `Rs.${totals.totalAdded.toFixed(2)}`],
                ['Machine Balance', `Rs.${totals.machineBalance.toFixed(2)}`],
                ['Transactions Count', totals.count.toString()]
            ],
            startY: finalY,
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 30, halign: 'right' } },
            margin: { left: 5, right: 5 },
        });
    }

    return pdf;
};


export const generateGameSessionPDF = (gameSessions, machines) => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');

    // Title & Date
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Game Session History', 14, 15);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Table Data
    const tableData = gameSessions.map(s => [
        new Date(s.createdAt).toLocaleString(),
        s?.machineId?.machineName || 'Unknown',
        s.sessionId,
        `Rs.${Number(s.totalBetAmount || 0).toFixed(2)}`,
        `Rs.${Number(s.finalAmount || 0).toFixed(2)}`,
        s.winners?.length || 0,
        s.winners?.map(w => w.winnerType).join(', ') || 'None'
    ]);

    const columns = ['Date & Time', 'Machine', 'Session ID', 'Total Bet', 'Final Amount', 'Winners', 'Winner Types'];

    autoTable(pdf, {
        head: [columns],
        body: tableData,
        startY: 30,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: {
            0: { cellWidth: 30, halign: 'left' }, // Date
            1: { cellWidth: 25, halign: 'left' }, // Machine
            2: { cellWidth: 35, halign: 'left' }, // Session ID
            3: { cellWidth: 25, halign: 'right' }, // Total Bet
            4: { cellWidth: 25, halign: 'right' }, // Final Amount
            5: { cellWidth: 20, halign: 'center' }, // Winners
            6: { cellWidth: 50, halign: 'left' } // Winner Types
        },
        margin: { top: 30, left: 5, right: 5, bottom: 20 },
        tableWidth: 'auto',
        showHead: 'everyPage',
        didDrawPage: function () {
            const pageNumber = pdf.internal.getCurrentPageInfo().pageNumber;
            pdf.setFontSize(8);
            pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.width - 20, pdf.internal.pageSize.height - 10);
        }
    });

    // Summary
    const finalY = pdf.lastAutoTable.finalY + 10;
    const totals = {
        bet: gameSessions.reduce((a, s) => a + Number(s.totalBetAmount || 0), 0),
        final: gameSessions.reduce((a, s) => a + Number(s.finalAmount || 0), 0),
        winners: gameSessions.reduce((a, s) => a + (s.winners?.length || 0), 0)
    };

    autoTable(pdf, {
        body: [
            ['Total Sessions', gameSessions.length],
            ['Total Bet Amount', `Rs.${totals.bet.toFixed(2)}`],
            ['Total Final Amount', `Rs.${totals.final.toFixed(2)}`],
            ['Total Winners', totals.winners]
        ],
        startY: finalY,
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 40, halign: 'right' } },
        margin: { left: 5, right: 5 }
    });

    return pdf;
};
