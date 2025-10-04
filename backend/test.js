 // Generate 24-hour timeframes with 15 min intervals
 const timeFrames = [];
 for (let h = 0; h < 24; h++) {
     for (let m = 0; m < 60; m += 15) {
         const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
         timeFrames.push({
             time,
             percentage: 10, // default percentage
             machineId: machine._id
         });
     }
 }
 console.log(timeFrames);