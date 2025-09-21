// Real-time Data Engine for CrowdSense VIT
class RealTimeEngine {
    constructor() {
        this.updateInterval = 3000; // 3 seconds
        this.isRunning = false;
        this.subscribers = new Map();
        this.lastUpdate = Date.now();
    }
    
    // Subscribe to real-time updates
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(callback);
    }
    
    // Unsubscribe from updates
    unsubscribe(eventType, callback) {
        if (this.subscribers.has(eventType)) {
            const callbacks = this.subscribers.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    // Emit event to subscribers
    emit(eventType, data) {
        if (this.subscribers.has(eventType)) {
            this.subscribers.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in subscriber callback:', error);
                }
            });
        }
    }
    
    // Start real-time updates
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🚀 Real-time engine started');
        
        this.intervalId = setInterval(() => {
            this.updateData();
        }, this.updateInterval);
        
        // Initial update
        this.updateData();
    }
    
    // Stop real-time updates
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.intervalId);
        console.log('⏹️ Real-time engine stopped');
    }
    
    // Update all data sources
    updateData() {
        const timestamp = Date.now();
        
        // Simulate real-time data updates
        simulateRealTimeData();
        
        // Emit crowd updates
        const crowdUpdates = VIT_CAMPUS_DATA.buildings.map(building => ({
            id: building.id,
            name: building.name,
            currentCrowd: building.currentCrowd,
            capacity: building.capacity,
            density: calculateCrowdDensity(building.currentCrowd, building.capacity),
            percentage: Math.round((building.currentCrowd / building.capacity) * 100),
            timestamp
        }));
        
        this.emit('crowdUpdate', crowdUpdates);
        
        // Emit parking updates
        const parkingUpdates = VIT_CAMPUS_DATA.parkingLots.map(lot => ({
            id: lot.id,
            name: lot.name,
            availableSpots: lot.availableSpots,
            totalSpots: lot.totalSpots,
            occupancyRate: Math.round(((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100),
            status: this.getParkingStatus(lot),
            timestamp
        }));
        
        this.emit('parkingUpdate', parkingUpdates);
        
        // Generate activity feed updates
        if (Math.random() < 0.4) { // 40% chance of new activity
            const activity = this.generateRandomActivity(timestamp);
            this.emit('activityUpdate', activity);
        }
        
        this.lastUpdate = timestamp;
    }
    
    // Get parking status based on availability
    getParkingStatus(lot) {
        const availabilityRate = lot.availableSpots / lot.totalSpots;
        if (availabilityRate === 0) return 'full';
        if (availabilityRate < 0.3) return 'limited';
        return 'available';
    }
    
    // Generate random activity for feed
    generateRandomActivity(timestamp) {
        const activities = [
            {
                type: 'crowd_decrease',
                icon: '📉',
                color: 'rgba(76,175,80,0.2)',
                templates: [
                    '{building} crowd decreased to {percentage}%',
                    'Less crowded at {building} now',
                    '{building} is getting quieter'
                ]
            },
            {
                type: 'crowd_increase',
                icon: '📈',
                color: 'rgba(255,193,7,0.2)',
                templates: [
                    '{building} getting busier - {percentage}% full',
                    'Crowd building up at {building}',
                    '{building} is getting crowded'
                ]
            },
            {
                type: 'parking_available',
                icon: '🚗',
                color: 'rgba(33,150,243,0.2)',
                templates: [
                    'New parking spots available at {parking}',
                    '{spots} spots freed up at {parking}',
                    'Parking space opened at {parking}'
                ]
            },
            {
                type: 'parking_full',
                icon: '🚫',
                color: 'rgba(244,67,54,0.2)',
                templates: [
                    '{parking} is now full',
                    'No more spots at {parking}',
                    '{parking} reached capacity'
                ]
            },
            {
                type: 'peak_hours',
                icon: '⏰',
                color: 'rgba(156,39,176,0.2)',
                templates: [
                    'Peak hours detected in Academic Zone',
                    'High activity period started',
                    'Campus getting busy - peak time'
                ]
            }
        ];
        
        const activityType = activities[Math.floor(Math.random() * activities.length)];
        const building = VIT_CAMPUS_DATA.buildings[Math.floor(Math.random() * VIT_CAMPUS_DATA.buildings.length)];
        const parking = VIT_CAMPUS_DATA.parkingLots[Math.floor(Math.random() * VIT_CAMPUS_DATA.parkingLots.length)];
        
        let template = activityType.templates[Math.floor(Math.random() * activityType.templates.length)];
        
        // Replace placeholders
        template = template
            .replace('{building}', building.name)
            .replace('{parking}', parking.name)
            .replace('{percentage}', Math.round((building.currentCrowd / building.capacity) * 100))
            .replace('{spots}', Math.floor(Math.random() * 5) + 1);
        
        return {
            id: `activity_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            type: activityType.type,
            icon: activityType.icon,
            color: activityType.color,
            text: template,
            timestamp,
            timeAgo: 'Just now'
        };
    }
    
    // Get current statistics
    getStats() {
        const totalCapacity = VIT_CAMPUS_DATA.buildings.reduce((sum, b) => sum + b.capacity, 0);
        const totalCrowd = VIT_CAMPUS_DATA.buildings.reduce((sum, b) => sum + b.currentCrowd, 0);
        const totalParkingSpots = VIT_CAMPUS_DATA.parkingLots.reduce((sum, p) => sum + p.totalSpots, 0);
        const availableParkingSpots = VIT_CAMPUS_DATA.parkingLots.reduce((sum, p) => sum + p.availableSpots, 0);
        
        return {
            campusOccupancy: Math.round((totalCrowd / totalCapacity) * 100),
            totalPeople: totalCrowd,
            parkingOccupancy: Math.round(((totalParkingSpots - availableParkingSpots) / totalParkingSpots) * 100),
            availableParking: availableParkingSpots,
            lastUpdate: this.lastUpdate,
            isActive: this.isRunning
        };
    }
    
    // Manual data refresh
    refresh() {
        console.log('🔄 Manual data refresh triggered');
        this.updateData();
    }
    
    // Get building data by ID
    getBuildingData(buildingId) {
        return VIT_CAMPUS_DATA.buildings.find(b => b.id === buildingId);
    }
    
    // Get parking data by ID
    getParkingData(parkingId) {
        return VIT_CAMPUS_DATA.parkingLots.find(p => p.id === parkingId);
    }
    
    // Simulate user report submission
    submitCrowdReport(buildingId, reportedDensity, userId = 'anonymous') {
        const building = this.getBuildingData(buildingId);
        if (!building) return false;
        
        // In a real app, this would be sent to a backend
        const report = {
            id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            buildingId,
            buildingName: building.name,
            reportedDensity,
            userId,
            timestamp: Date.now(),
            coordinates: building.coordinates
        };
        
        console.log('📝 Crowd report submitted:', report);
        
        // Emit report event
        this.emit('reportSubmitted', report);
        
        // Simulate slight adjustment to crowd data based on report
        const densityMap = { low: 0.2, medium: 0.5, high: 0.8 };
        const targetCrowd = Math.floor(building.capacity * densityMap[reportedDensity]);
        const adjustment = (targetCrowd - building.currentCrowd) * 0.1;
        building.currentCrowd = Math.max(0, Math.min(building.capacity, building.currentCrowd + adjustment));
        
        return report;
    }
}

// Create global instance
const realTimeEngine = new RealTimeEngine();

// Auto-start when page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        realTimeEngine.start();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RealTimeEngine, realTimeEngine };
}