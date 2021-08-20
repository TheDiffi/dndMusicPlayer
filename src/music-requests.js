const { ipcMain } = require('electron')


ipcMain.on('music-request', (event, topic) => {
    console.log(topic);
    let url;
    switch (topic) {
        case 'tavern':
            url = 'https://www.youtube.com/embed/dd10InDdvJE?autoplay=1';
            break;
        case 'battle':
            url = 'https://www.youtube.com/embed/lAGm9MTyRJ8?autoplay=1';
            break;
        case 'village':
            url = 'https://www.youtube.com/embed/Wd3kd0zY2bQ?autoplay=1';
            break;
        case 'forest':
            url = 'https://www.youtube.com/embed/6Em9tLXbhfo?autoplay=1';
            break;
        case 'field':
            url = 'https://www.youtube.com/embed/0qcsdctvhTM?autoplay=1';
            break;
        case 'rain':
            url = 'https://www.youtube.com/embed/KSSpVMIgN2Y?autoplay=1';
            break;
        case 'chatter':
            url = 'https://www.youtube.com/embed/EULoybB2Nsw?autoplay=1';
            break;
    }

    event.returnValue = url;

});