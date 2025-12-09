/**
 * Basic Generic scene class 
 */
abstract class Scene {
    protected abstract directoryHeader: string;
    protected abstract sceneName: string
    protected abstract description: string;

    protected abstract maxProgress: number;
    protected abstract sceneObjectives: { [key: string]: boolean };

    protected audioPlayer: SceneAudioPlayer;

    constructor() {
        // Initialize Communication
        this.initializeCommunication();

        // Initialize the audio player
        this.audioPlayer = new SceneAudioPlayer();
        this.audioPlayer.setAudioElement("narration-one", [], () => {
            console.log("Audio narration finished.");
        });

        // Attempt to play audio (may be blocked by browser autoplay policy)
        this.audioPlayer.play().catch(err => {
            console.log("Autoplay prevented. Requesting parent to prompt user.");
            // Notify parent window to show audio permission prompt
            window.parent.postMessage({ type: "AUDIO_PERMISSION_NEEDED" }, "*");
        });

        // Send initialization finished beacon
        this.sendInitializationFinishedBeacon();
    }

    /**
     * Send Initialization finished beacon to Scene Manager
     */
    private sendInitializationFinishedBeacon(): void {
        // Send becon that scene is loaded
        const interval = setInterval(() => {
            // Notify parent window that scene has loaded
            window.parent.postMessage({ type: "SCENE_LOADED" }, "*");
        }, 100);

        // Stop sending beacon after receiving an OK from parent
        window.addEventListener("message", (event: MessageEvent) => {
            const messageData = event.data;
            if (messageData && messageData.type === "SCENE_LOAD_OK") {
                clearInterval(interval);
            }
        });
    }

    /**
     * Initialize communication with Scene Manager
     */
    private initializeCommunication(): void {
        // Listen for messages from Scene Manager
        window.addEventListener("message", (event) => {
            // Ensure it is from the parent window
            if (event.source !== window.parent) {
                return;
            }

            // Get Message Data
            const message = event.data;
            // Handle the message 
            if (message.type === "GET_INFO") {
                // Respond with scene information
                const sceneInfo = {
                    directoryHeader: this.directoryHeader,
                    sceneName: this.sceneName,
                    description: this.description,
                    maxProgress: this.maxProgress
                };
                // Post the message back to the parent window with the secureTransferID
                window.parent.postMessage({ ...sceneInfo, secureTransferID: message.secureTransferID }, "*");
            } else if (message.type === "PLAY_AUDIO") {
                // Retry playing audio after user permission
                this.audioPlayer.play().catch(err => {
                    console.warn("Audio playback still blocked after permission:", err);
                });
            }
        });
    }

    /**
     * Disable interactions within the scene
     */
    public disableInteractions(): void {
        // Disable all circular buttons
        const buttons = document.querySelectorAll('.circular-button');
        buttons.forEach((button) => {
            (button as HTMLElement).style.pointerEvents = 'none';
            (button as HTMLElement).style.opacity = '0.5';
        });
    }

    /**
     * Enable interactions within the scene
     */
    public enableInteractions(): void {
        // Enable all circular buttons
        const buttons = document.querySelectorAll('.circular-button');
        buttons.forEach((button) => {
            (button as HTMLElement).style.pointerEvents = 'auto';
            (button as HTMLElement).style.opacity = '1';
        });
    }

    /**
     * Update objectives and scene progress
     */
    protected updateObjectivesAndProgress(objective: string): void {
        if (!this.sceneObjectives.hasOwnProperty(objective)) {
            console.warn(`Objective "${objective}" does not exist in the scene objectives.`);
            return;
        }

        // Mark the objective as completed
        if (this.sceneObjectives[objective] === true) { return; } // Already completed
        this.sceneObjectives[objective] = true;

        // Notify Scene Manager to increment progress bar
        this.sendProgressUpdate();
    }

    /**
     * Communicate to Scene Manager to increment progress bar
     */
    private sendProgressUpdate(): void {
        window.parent.postMessage({ type: "PROGRESS_UPDATE" }, "*");
    }
}

class SingleClickButton {
    private element: HTMLElement;
    private isEnabled: boolean = true;

    constructor(elementID: string, pulseAndRippleEffects: boolean, onClick: () => void) {
        // Get the button element
        const buttonElement = document.getElementById(elementID);
        if (!buttonElement) {
            throw new Error(`Button element with ID "${elementID}" not found.`);
        }
        this.element = buttonElement;

        // Attach click event listener
        this.element.addEventListener("click", () => {
            if (this.isEnabled) {
                if (pulseAndRippleEffects)
                    this.createRipple();
                onClick();
            }
        });

        if (!pulseAndRippleEffects) {
            this.element.classList.remove("pulse");
        }

        // Remove pulse animation on first hover
        this.element.addEventListener("mouseenter", () => {
            this.element.classList.remove("pulse");
        }, { once: true });
    }

    /**
     * Create a ripple effect when button is clicked
     */
    private createRipple(): void {
        const ripple = document.createElement("div");
        ripple.style.position = "absolute";
        ripple.style.width = "100%";
        ripple.style.height = "100%";
        ripple.style.borderRadius = "50%";
        ripple.style.background = "rgba(255, 255, 255, 0.6)";
        ripple.style.transform = "scale(0)";
        ripple.style.animation = "ripple 0.6s ease-out";
        ripple.style.pointerEvents = "none";

        this.element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Enable or disable the button
     */
    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (enabled) {
            this.element.style.opacity = "1";
            this.element.style.cursor = "pointer";
        } else {
            this.element.style.opacity = "0.5";
            this.element.style.cursor = "not-allowed";
        }
    }

    /**
     * Hide the button
     */
    public hide(): void {
        this.element.style.display = "none";
    }

    /**
     * Show the button
     */
    public show(): void {
        this.element.style.display = "flex";
    }
}

class SceneAudioPlayer {
    private audioElement!: HTMLAudioElement;

    private timestampEvents: Array<{ timestamp: number; callback: () => void }> = [];
    private triggeredEvents: Set<number> = new Set();
    private timeUpdateHandler: (() => void) | null = null;
    private endedHandler: (() => void) | null = null;
    private seekedHandler: (() => void) | null = null;
    private finishHandler: (() => void) | null = null;

    private forceSkipAudioKeybind: string = "Space";

    constructor() 
    {
        this.initializeKeybinds();
    }

    /**
     * Initialize keybinds for audio control
     */
    private initializeKeybinds(): void {
        window.addEventListener("keydown", (event) => {
            if (
                event.code === this.forceSkipAudioKeybind 
                && this.audioElement
                && this.audioElement.currentTime !== this.audioElement.duration
            ) {
                // Trigger all remaining events in order
                this.timestampEvents.forEach((event, index) => {
                    // Only trigger if not already triggered
                    if (!this.triggeredEvents.has(index)) {
                        this.triggeredEvents.add(index);
                        event.callback();
                    }
                });

                // Skip to the end of the audio
                this.audioElement.currentTime = this.audioElement.duration;
            }
        });
    }

    /**
     * Initialize the audio element reference
     */
    public setAudioElement(
        elementID: string, 
        timestampEvents: Array<{ timestamp: number; callback: () => void }> = [],
        onFinish: () => void = () => {}
    ): void {
        // Ensure the element exists
        if (document.getElementById(elementID) === null) {
            throw new Error(`Audio element with ID "${elementID}" not found.`);
        }
        // Stop the audio if already playing and clean up old listeners
        if (this.audioElement) {
            this.stop();
            this.cleanupEventListeners();
        }
        // Get the audio element
        this.audioElement = document.getElementById(elementID) as HTMLAudioElement;
        
        // Set up timestamp event listeners
        this.setupTimestampEvents(timestampEvents);
        
        // Set up onFinish callback
        this.finishHandler = () => {
            onFinish();
        };
        this.audioElement.addEventListener('ended', this.finishHandler);
    }
    
    /**
     * Setup timestamp-based event listeners for audio playback
     */
    private setupTimestampEvents(timestampEvents: Array<{ timestamp: number; callback: () => void }>): void {
        // No events to set up
        if (!timestampEvents || timestampEvents.length === 0) { this.timestampEvents = []; return; };
        
        // Sort events by timestamp
        timestampEvents = timestampEvents.sort((a, b) => a.timestamp - b.timestamp);       

        // Warn user if an event is set beyond audio duration
        const audioDuration = this.audioElement.duration;
        timestampEvents.forEach(event => {
            if (event.timestamp > audioDuration) {
                console.warn(
                    `Timestamp event at ${event.timestamp}s exceeds audio duration of ${audioDuration}s. Removing this event.`
                );
                timestampEvents = timestampEvents.filter(e => e !== event);
            }
        });

        // Set them
        this.timestampEvents = timestampEvents;
        
        // Clear triggered events for new audio
        this.triggeredEvents.clear();
        
        // Create and store event handlers
        this.timeUpdateHandler = () => {
            const currentTime = this.audioElement.currentTime;
            
            this.timestampEvents.forEach((event, index) => {
                // Trigger event if we've passed the timestamp and it hasn't been triggered yet
                if (currentTime >= event.timestamp && !this.triggeredEvents.has(index)) {
                    this.triggeredEvents.add(index);
                    event.callback();
                }
            });
        };
        
        this.endedHandler = () => {
            this.triggeredEvents.clear();
        };
        
        this.seekedHandler = () => {
            // Clear events that are after the current time
            const currentTime = this.audioElement.currentTime;
            this.timestampEvents.forEach((event, index) => {
                if (event.timestamp > currentTime) {
                    this.triggeredEvents.delete(index);
                }
            });
        };
        
        // Attach event listeners
        this.audioElement.addEventListener('timeupdate', this.timeUpdateHandler);
        this.audioElement.addEventListener('ended', this.endedHandler);
        this.audioElement.addEventListener('seeked', this.seekedHandler);
    }
    
    /**
     * Clean up all event listeners from audio element
     */
    private cleanupEventListeners(): void {
        if (!this.audioElement) return;
        
        if (this.timeUpdateHandler) {
            this.audioElement.removeEventListener('timeupdate', this.timeUpdateHandler);
            this.timeUpdateHandler = null;
        }
        if (this.endedHandler) {
            this.audioElement.removeEventListener('ended', this.endedHandler);
            this.endedHandler = null;
        }
        if (this.seekedHandler) {
            this.audioElement.removeEventListener('seeked', this.seekedHandler);
            this.seekedHandler = null;
        }
        if (this.finishHandler) {
            this.audioElement.removeEventListener('ended', this.finishHandler);
            this.finishHandler = null;
        }
        
        this.triggeredEvents.clear();
        this.timestampEvents = [];
    }

    /**
     * Play the audio
     */
    public async play(): Promise<void> {
        if (!this.audioElement) { 
            console.warn("Cannot play, Audio element not set."); 
            return Promise.reject("Audio element not set");
        }
        try {
            await this.audioElement.play();
        } catch (error) {
            console.warn("Audio play failed:", error);
            throw error;
        }
    }

    /**
     * Pause the audio
     */
    public pause(): void {
        if (!this.audioElement) { console.warn("Cannot pause, Audio element not set."); return; }
        this.audioElement.pause();
    }

    /**
     * Stop the audio
     */
    public stop(): void {
        if (!this.audioElement) { console.warn("Cannot stop, Audio element not set."); return; }
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.triggeredEvents.clear();
    }
}

class DraggableElement {
    private element: HTMLElement;
    private isDragging: boolean = false;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private initialX: number = 0;
    private initialY: number = 0;

    constructor(elementID: string) {
        // Get the draggable element
        const el = document.getElementById(elementID);
        if (!el) {
            throw new Error(`Draggable element with ID "${elementID}" not found.`);
        }
        this.element = el;

        // Make element draggable
        this.element.style.position = 'absolute';
        this.element.style.cursor = 'grab';

        // Store initial position from computed style
        const computedStyle = window.getComputedStyle(this.element);
        this.initialX = parseInt(computedStyle.left) || this.element.offsetLeft;
        this.initialY = parseInt(computedStyle.top) || this.element.offsetTop;

        // Attach event listeners
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    private onMouseDown(e: MouseEvent): void {
        // Don't allow dragging if cursor is not-allowed (disabled state)
        if (this.element.style.cursor === 'not-allowed') {
            return;
        }
        
        this.isDragging = true;
        this.element.style.cursor = 'grabbing';
        this.element.style.zIndex = '999';

        // Calculate offset between mouse and element position
        this.offsetX = e.clientX - this.element.offsetLeft;
        this.offsetY = e.clientY - this.element.offsetTop;

        e.preventDefault();
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.isDragging) return;

        // Update element position
        this.element.style.left = `${e.clientX - this.offsetX}px`;
        this.element.style.top = `${e.clientY - this.offsetY}px`;
    }

    private onMouseUp(e: MouseEvent): void {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.element.style.cursor = 'grab';
        this.element.style.zIndex = '';
    }

    /**
     * Get the DOM element
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    /**
     * Reset element to its initial position
     */
    public resetPosition(): void {
        // Add smooth transition
        this.element.style.transition = 'left 0.3s ease, top 0.3s ease';
        this.element.style.left = `${this.initialX}px`;
        this.element.style.top = `${this.initialY}px`;
        
        // Remove transition after animation completes
        setTimeout(() => {
            this.element.style.transition = '';
        }, 300);
    }

    /**
     * Snap element to a specific position
     */
    public snapToPosition(x: number, y: number): void {
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    /**
     * Disable dragging
     */
    public disable(): void {
        this.isDragging = false;
        this.element.style.cursor = 'not-allowed';
        this.element.style.opacity = '0.5';
        this.element.style.pointerEvents = 'none';
    }

    /**
     * Enable dragging
     */
    public enable(): void {
        this.element.style.cursor = 'grab';
        this.element.style.opacity = '1';
        this.element.style.pointerEvents = 'auto';
    }
}

class DraggablePlaceSpot {
    private element: HTMLElement;
    private participatingDraggables: DraggableElement[];
    private acceptedDraggable: DraggableElement;
    private onCorrectlyPlaced: () => void;
    private onIncorrectlyPlaced: () => void;
    private isOccupied: boolean = false;
    private centerX: number = 0;
    private centerY: number = 0;
    private snapRadius: number = 50;

    constructor(
        elementID: string, 
        participatingDraggables: DraggableElement[], 
        acceptedDraggable: DraggableElement,
        onCorrectlyPlaced: () => void,
        onIncorrectlyPlaced: () => void
    ) {
        // Get the place spot element
        const el = document.getElementById(elementID);
        if (!el) {
            throw new Error(`Draggable place spot element with ID "${elementID}" not found.`);
        }
        this.element = el;
        this.participatingDraggables = participatingDraggables;
        this.acceptedDraggable = acceptedDraggable;
        this.onCorrectlyPlaced = onCorrectlyPlaced;
        this.onIncorrectlyPlaced = onIncorrectlyPlaced;

        // Calculate center position
        this.updateCenterPosition();

        // Attach drop detection to all participating draggables
        this.participatingDraggables.forEach(draggable => {
            const element = draggable.getElement();
            element.addEventListener('mouseup', () => this.checkDrop(draggable));
        });

        // Update center position on window resize
        window.addEventListener('resize', () => this.updateCenterPosition());
    }

    /**
     * Update the center position of the place spot
     */
    private updateCenterPosition(): void {
        const rect = this.element.getBoundingClientRect();
        this.centerX = rect.left + rect.width / 2;
        this.centerY = rect.top + rect.height / 2;
    }

    /**
     * Check if a draggable element is dropped on this spot
     */
    private checkDrop(draggable: DraggableElement): void {
        if (this.isOccupied) return;

        const dragElement = draggable.getElement();
        const dragRect = dragElement.getBoundingClientRect();
        const dragCenterX = dragRect.left + dragRect.width / 2;
        const dragCenterY = dragRect.top + dragRect.height / 2;

        // Calculate distance from drag center to spot center
        const distance = Math.sqrt(
            Math.pow(dragCenterX - this.centerX, 2) + 
            Math.pow(dragCenterY - this.centerY, 2)
        );

        // Check if within snap radius
        if (distance <= this.snapRadius) {
            // Check if it's the correct draggable
            if (draggable === this.acceptedDraggable) {
                this.snapDraggableToSpot(draggable);
                this.isOccupied = true;
                this.onCorrectlyPlaced();
            } else {
                // Wrong draggable - reset position
                draggable.resetPosition();
                this.onIncorrectlyPlaced();
            }
        }
    }

    /**
     * Snap a draggable element to the center of this spot
     */
    private snapDraggableToSpot(draggable: DraggableElement): void {
        const dragElement = draggable.getElement();
        const rect = this.element.getBoundingClientRect();
        
        // Calculate position to center the draggable on the spot
        const snapX = rect.left + (rect.width / 2) - (dragElement.offsetWidth / 2);
        const snapY = rect.top + (rect.height / 2) - (dragElement.offsetHeight / 2);
        
        draggable.snapToPosition(snapX, snapY);
        draggable.disable();
        
        // Visual feedback - add checkmark and hide text
        this.element.classList.add('completed');
        this.element.style.color = 'transparent';
    }

    /**
     * Reset the place spot
     */
    public reset(): void {
        this.isOccupied = false;
        this.element.classList.remove('completed');
        this.element.style.color = '';
    }

    /**
     * Set the snap radius for drop detection
     */
    public setSnapRadius(radius: number): void {
        this.snapRadius = radius;
    }
}