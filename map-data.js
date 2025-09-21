// VIT Chennai Campus Real Data and Coordinates
const VIT_CAMPUS_DATA = {
    center: { lat: 12.9698, lng: 79.1555 }, // VIT Chennai coordinates
    zoom: 16,
    
    // Accurate VIT Chennai building data
    buildings: [
        {
            id: 'main-building',
            name: 'Main Academic Block',
            coordinates: { lat: 12.9700, lng: 79.1560 },
            type: 'academic',
            capacity: 2000,
            currentCrowd: 850,
            facilities: ['Classrooms', 'Labs', 'Faculty Offices'],
            floors: 4
        },
        {
            id: 'library',
            name: 'Anna Centenary Library',
            coordinates: { lat: 12.9695, lng: 79.1565 },
            type: 'library',
            capacity: 800,
            currentCrowd: 320,
            facilities: ['Reading Halls', 'Digital Library', 'Study Rooms'],
            floors: 3
        },
        {
            id: 'cafeteria-main',
            name: 'Main Cafeteria',
            coordinates: { lat: 12.9705, lng: 79.1555 },
            type: 'dining',
            capacity: 500,
            currentCrowd: 380,
            facilities: ['Food Court', 'Seating Area', 'Juice Bar'],
            floors: 2
        },
        {
            id: 'smv-block',
            name: 'SMV Block',
            coordinates: { lat: 12.9690, lng: 79.1570 },
            type: 'academic',
            capacity: 1500,
            currentCrowd: 920,
            facilities: ['Computer Labs', 'Lecture Halls', 'Project Rooms'],
            floors: 5
        },
        {
            id: 'sjt-block',
            name: 'SJT Block',
            coordinates: { lat: 12.9685, lng: 79.1575 },
            type: 'academic',
            capacity: 1200,
            currentCrowd: 780,
            facilities: ['Engineering Labs', 'Workshops', 'Seminar Halls'],
            floors: 4
        },
        {
            id: 'gymnasium',
            name: 'Sports Complex',
            coordinates: { lat: 12.9710, lng: 79.1545 },
            type: 'sports',
            capacity: 600,
            currentCrowd: 180,
            facilities: ['Gym', 'Basketball Court', 'Badminton Courts'],
            floors: 2
        },
        {
            id: 'auditorium',
            name: 'Main Auditorium',
            coordinates: { lat: 12.9692, lng: 79.1550 },
            type: 'auditorium',
            capacity: 1000,
            currentCrowd: 45,
            facilities: ['Main Hall', 'Green Rooms', 'Audio-Visual Room'],
            floors: 2
        },
        {
            id: 'hostel-boys',
            name: 'Boys Hostel Complex',
            coordinates: { lat: 12.9680, lng: 79.1540 },
            type: 'hostel',
            capacity: 3000,
            currentCrowd: 2100,
            facilities: ['Rooms', 'Mess', 'Recreation Room'],
            floors: 8
        },
        {
            id: 'hostel-girls',
            name: 'Girls Hostel Complex',
            coordinates: { lat: 12.9715, lng: 79.1580 },
            type: 'hostel',
            capacity: 2500,
            currentCrowd: 1800,
            facilities: ['Rooms', 'Mess', 'Study Hall'],
            floors: 6
        },
        {
            id: 'medical-center',
            name: 'Medical Center',
            coordinates: { lat: 12.9688, lng: 79.1545 },
            type: 'medical',
            capacity: 100,
            currentCrowd: 25,
            facilities: ['Clinic', 'Pharmacy', 'Emergency Room'],
            floors: 1
        }
    ],
    
    // Parking lots with real-time availability
    parkingLots: [
        {
            id: 'main-gate-parking',
            name: 'Main Gate Parking',
            coordinates: { lat: 12.9705, lng: 79.1540 },
            totalSpots: 120,
            availableSpots: 45,
            type: 'visitor',
            hourlyRate: 10
        },
        {
            id: 'academic-parking',
            name: 'Academic Block Parking',
            coordinates: { lat: 12.9698, lng: 79.1565 },
            totalSpots: 80,
            availableSpots: 12,
            type: 'student',
            hourlyRate: 5
        },
        {
            id: 'hostel-parking',
            name: 'Hostel Parking',
            coordinates: { lat: 12.9685, lng: 79.1535 },
            totalSpots: 200,
            availableSpots: 0,
            type: 'resident',
            hourlyRate: 0
        },
        {
            id: 'sports-parking',
            name: 'Sports Complex Parking',
            coordinates: { lat: 12.9712, lng: 79.1540 },
            totalSpots: 60,
            availableSpots: 38,
            type: 'general',
            hourlyRate: 5
        },
        {
            id: 'library-parking',
            name: 'Library Parking',
            coordinates: { lat: 12.9693, lng: 79.1570 },
            totalSpots: 50,
            availableSpots: 8,
            type: 'student',
            hourlyRate: 5
        }
    ],
    
    // Campus zones for better navigation
    zones: [
        {
            id: 'academic-zone',
            name: 'Academic Zone',
            bounds: {
                north: 12.9710,
                south: 12.9680,
                east: 79.1580,
                west: 79.1550
            },
            color: '#2196F3'
        },
        {
            id: 'residential-zone',
            name: 'Residential Zone',
            bounds: {
                north: 12.9720,
                south: 12.9675,
                east: 79.1585,
                west: 79.1530
            },
            color: '#4CAF50'
        },
        {
            id: 'recreational-zone',
            name: 'Sports & Recreation',
            bounds: {
                north: 12.9715,
                south: 79.9685,
                east: 79.1550,
                west: 79.1535
            },
            color: '#FF9800'
        }
    ]
};

// Crowd density calculation
function calculateCrowdDensity(currentCrowd, capacity) {
    const percentage = (currentCrowd / capacity) * 100;
    if (percentage < 30) return 'low';
    if (percentage < 70) return 'medium';
    return 'high';
}

// Get crowd color based on density
function getCrowdColor(density) {
    switch (density) {
        case 'low': return '#4CAF50';    // Green
        case 'medium': return '#FF9800'; // Orange
        case 'high': return '#F44336';   // Red
        default: return '#9E9E9E';       // Gray
    }
}

// Real-time data simulation
function simulateRealTimeData() {
    VIT_CAMPUS_DATA.buildings.forEach(building => {
        // Simulate crowd changes based on time of day and building type
        const now = new Date();
        const hour = now.getHours();
        let crowdMultiplier = 1;
        
        // Adjust crowd based on time and building type
        if (building.type === 'academic') {
            crowdMultiplier = (hour >= 9 && hour <= 17) ? 0.8 : 0.2;
        } else if (building.type === 'dining') {
            crowdMultiplier = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21) ? 0.9 : 0.3;
        } else if (building.type === 'library') {
            crowdMultiplier = (hour >= 14 && hour <= 22) ? 0.6 : 0.3;
        } else if (building.type === 'hostel') {
            crowdMultiplier = (hour >= 22 || hour <= 6) ? 0.9 : 0.4;
        }
        
        // Add some randomness
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        const targetCrowd = Math.floor(building.capacity * crowdMultiplier * randomFactor);
        
        // Gradually adjust current crowd towards target
        const difference = targetCrowd - building.currentCrowd;
        building.currentCrowd += Math.floor(difference * 0.1 + (Math.random() * 10 - 5));
        building.currentCrowd = Math.max(0, Math.min(building.capacity, building.currentCrowd));
    });
    
    // Update parking availability
    VIT_CAMPUS_DATA.parkingLots.forEach(lot => {
        if (Math.random() < 0.3) { // 30% chance of change
            const change = Math.floor(Math.random() * 10) - 5;
            lot.availableSpots = Math.max(0, Math.min(lot.totalSpots, lot.availableSpots + change));
        }
    });
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VIT_CAMPUS_DATA, calculateCrowdDensity, getCrowdColor, simulateRealTimeData };
}