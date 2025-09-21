// Interactive Map Controls for CrowdSense VIT
class MapController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentZoom = 1;
        this.maxZoom = 3;
        this.minZoom = 0.5;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.selectedBuilding = null;
        this.buildingElements = new Map();
        this.overlayElements = new Map();
        
        this.init();
    }
    
    init() {
        this.setupMapContainer();
        this.setupEventListeners();
        this.renderBuildings();
        this.setupRealTimeUpdates();
    }
    
    setupMapContainer() {
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.cursor = 'grab';
        this.container.style.userSelect = 'none';
        
        // Create map viewport
        this.viewport = document.createElement('div');
        this.viewport.className = 'map-viewport';
        this.viewport.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform-origin: center center;
            transition: transform 0.3s ease;
        `;
        
        this.container.appendChild(this.viewport);
        
        // Add zoom controls
        this.addZoomControls();
        
        // Add campus background
        this.addCampusBackground();
    }
    
    addCampusBackground() {
        const background = document.createElement('div');
        background.className = 'campus-background';
        background.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            background-image: 
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        `;
        this.viewport.appendChild(background);
    }
    
    addZoomControls() {
        const controls = document.createElement('div');
        controls.className = 'map-controls';
        controls.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;
        
        const zoomIn = this.createControlButton('+', () => this.zoomIn());
        const zoomOut = this.createControlButton('-', () => this.zoomOut());
        const reset = this.createControlButton('⌂', () => this.resetView());
        
        controls.appendChild(zoomIn);
        controls.appendChild(zoomOut);
        controls.appendChild(reset);
        
        this.container.appendChild(controls);
    }
    
    createControlButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            width: 35px;
            height: 35px;
            border: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255,255,255,0.2)';
            button.style.transform = 'scale(1.1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(255,255,255,0.1)';
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('click', onClick);
        return button;
    }
    
    setupEventListeners() {
        // Mouse events for pan and zoom
        this.container.addEventListener('mousedown', (e) => this.startDrag(e));
        this.container.addEventListener('mousemove', (e) => this.drag(e));
        this.container.addEventListener('mouseup', () => this.endDrag());
        this.container.addEventListener('mouseleave', () => this.endDrag());
        this.container.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Touch events for mobile
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.container.addEventListener('touchend', () => this.endDrag());
        
        // Prevent context menu
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.container.style.cursor = 'grabbing';
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMousePos.x;
        const deltaY = e.clientY - this.lastMousePos.y;
        
        this.panX += deltaX;
        this.panY += deltaY;
        
        this.updateTransform();
        
        this.lastMousePos = { x: e.clientX, y: e.clientY };
    }
    
    endDrag() {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
    }
    
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoom(this.currentZoom + delta);
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.startDrag({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    handleTouchMove(e) {
        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            this.drag({ clientX: touch.clientX, clientY: touch.clientY });
        }
        e.preventDefault();
    }
    
    zoomIn() {
        this.zoom(this.currentZoom + 0.2);
    }
    
    zoomOut() {
        this.zoom(this.currentZoom - 0.2);
    }
    
    zoom(newZoom) {
        this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
        this.updateTransform();
    }
    
    resetView() {
        this.currentZoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
    }
    
    updateTransform() {
        this.viewport.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
    }
    
    renderBuildings() {
        VIT_CAMPUS_DATA.buildings.forEach(building => {
            this.createBuildingElement(building);
        });
    }
    
    createBuildingElement(building) {
        // Convert lat/lng to pixel coordinates (simplified)
        const pixelPos = this.latLngToPixel(building.coordinates);
        
        // Create building element
        const buildingEl = document.createElement('div');
        buildingEl.className = 'interactive-building';
        buildingEl.id = `building-${building.id}`;
        buildingEl.style.cssText = `
            position: absolute;
            left: ${pixelPos.x}px;
            top: ${pixelPos.y}px;
            width: ${this.getBuildingWidth(building)}px;
            height: ${this.getBuildingHeight(building)}px;
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            z-index: 10;
        `;
        
        // Add building label
        const label = document.createElement('div');
        label.className = 'building-label';
        label.textContent = building.name;
        label.style.cssText = `
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: rgba(255,255,255,0.8);
            text-align: center;
            white-space: nowrap;
            pointer-events: none;
        `;
        buildingEl.appendChild(label);
        
        // Add click handler
        buildingEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectBuilding(building);
        });
        
        // Add hover effects
        buildingEl.addEventListener('mouseenter', () => {
            buildingEl.style.transform = 'scale(1.05)';
            buildingEl.style.background = 'rgba(255,255,255,0.15)';
        });
        
        buildingEl.addEventListener('mouseleave', () => {
            if (this.selectedBuilding?.id !== building.id) {
                buildingEl.style.transform = 'scale(1)';
                buildingEl.style.background = 'rgba(255,255,255,0.1)';
            }
        });
        
        this.viewport.appendChild(buildingEl);
        this.buildingElements.set(building.id, buildingEl);
        
        // Create crowd overlay
        this.createCrowdOverlay(building);
    }
    
    createCrowdOverlay(building) {
        const pixelPos = this.latLngToPixel(building.coordinates);
        const density = calculateCrowdDensity(building.currentCrowd, building.capacity);
        const overlaySize = Math.max(this.getBuildingWidth(building), this.getBuildingHeight(building)) + 40;
        
        const overlay = document.createElement('div');
        overlay.className = `crowd-overlay ${density}`;
        overlay.id = `overlay-${building.id}`;
        overlay.style.cssText = `
            position: absolute;
            left: ${pixelPos.x + this.getBuildingWidth(building)/2 - overlaySize/2}px;
            top: ${pixelPos.y + this.getBuildingHeight(building)/2 - overlaySize/2}px;
            width: ${overlaySize}px;
            height: ${overlaySize}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 5;
            animation: pulse 3s infinite;
        `;
        
        this.updateOverlayColor(overlay, density);
        this.viewport.appendChild(overlay);
        this.overlayElements.set(building.id, overlay);
    }
    
    updateOverlayColor(overlay, density) {
        const colors = {
            low: 'radial-gradient(circle, rgba(76,175,80,0.4) 0%, rgba(76,175,80,0.1) 50%, transparent 100%)',
            medium: 'radial-gradient(circle, rgba(255,193,7,0.4) 0%, rgba(255,193,7,0.1) 50%, transparent 100%)',
            high: 'radial-gradient(circle, rgba(244,67,54,0.4) 0%, rgba(244,67,54,0.1) 50%, transparent 100%)'
        };
        overlay.style.background = colors[density] || colors.low;
    }
    
    latLngToPixel(coordinates) {
        // Simplified conversion - in a real app, you'd use proper map projection
        const centerLat = VIT_CAMPUS_DATA.center.lat;
        const centerLng = VIT_CAMPUS_DATA.center.lng;
        const scale = 10000; // Adjust this for proper scaling
        
        const x = (coordinates.lng - centerLng) * scale + this.container.offsetWidth / 2;
        const y = (centerLat - coordinates.lat) * scale + this.container.offsetHeight / 2;
        
        return { x, y };
    }
    
    getBuildingWidth(building) {
        const baseWidth = Math.sqrt(building.capacity / 10);
        return Math.max(40, Math.min(100, baseWidth));
    }
    
    getBuildingHeight(building) {
        const baseHeight = building.floors * 8 + 20;
        return Math.max(30, Math.min(80, baseHeight));
    }
    
    selectBuilding(building) {
        // Deselect previous building
        if (this.selectedBuilding) {
            const prevEl = this.buildingElements.get(this.selectedBuilding.id);
            if (prevEl) {
                prevEl.style.transform = 'scale(1)';
                prevEl.style.background = 'rgba(255,255,255,0.1)';
                prevEl.style.borderColor = 'rgba(255,255,255,0.3)';
            }
        }
        
        // Select new building
        this.selectedBuilding = building;
        const buildingEl = this.buildingElements.get(building.id);
        if (buildingEl) {
            buildingEl.style.transform = 'scale(1.1)';
            buildingEl.style.background = 'linear-gradient(135deg, #2d1b69, #11998e)';
            buildingEl.style.borderColor = 'rgba(255,255,255,0.6)';
        }
        
        // Show building details
        this.showBuildingDetails(building);
    }
    
    showBuildingDetails(building) {
        const density = calculateCrowdDensity(building.currentCrowd, building.capacity);
        const percentage = Math.round((building.currentCrowd / building.capacity) * 100);
        
        const statusText = {
            'low': 'Free to visit',
            'medium': 'Moderately busy',
            'high': 'Very crowded'
        };
        
        const message = `
            <strong>${building.name}</strong><br>
            👥 ${building.currentCrowd}/${building.capacity} people (${percentage}%)<br>
            📍 ${building.facilities.join(', ')}<br>
            🏢 ${building.floors} floors<br>
            <em>${statusText[density]}</em>
        `;
        
        this.showNotification(message, density === 'high' ? 'warning' : 'info');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.innerHTML = message;
            notification.style.background = type === 'warning' ? 
                'linear-gradient(135deg, #f44336, #d32f2f)' : 
                'linear-gradient(135deg, #2d1b69, #11998e)';
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }
    
    setupRealTimeUpdates() {
        // Subscribe to real-time crowd updates
        realTimeEngine.subscribe('crowdUpdate', (updates) => {
            updates.forEach(update => {
                const overlay = this.overlayElements.get(update.id);
                if (overlay) {
                    this.updateOverlayColor(overlay, update.density);
                    overlay.className = `crowd-overlay ${update.density}`;
                }
                
                // Update building data
                const building = VIT_CAMPUS_DATA.buildings.find(b => b.id === update.id);
                if (building) {
                    building.currentCrowd = update.currentCrowd;
                }
            });
        });
    }
    
    // Focus on specific building
    focusOnBuilding(buildingId) {
        const building = VIT_CAMPUS_DATA.buildings.find(b => b.id === buildingId);
        if (building) {
            const pixelPos = this.latLngToPixel(building.coordinates);
            
            // Center the building in view
            this.panX = this.container.offsetWidth / 2 - pixelPos.x;
            this.panY = this.container.offsetHeight / 2 - pixelPos.y;
            this.currentZoom = 1.5;
            
            this.updateTransform();
            this.selectBuilding(building);
        }
    }
    
    // Get buildings in current view
    getBuildingsInView() {
        // Simplified - in a real app, you'd calculate based on viewport bounds
        return VIT_CAMPUS_DATA.buildings;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapController };
}