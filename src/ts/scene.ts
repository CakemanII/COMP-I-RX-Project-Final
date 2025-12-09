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
        this.audioPlayer.setAudioElement("narration-one");
        // Attempt to play audio (may be blocked by browser autoplay policy)
        this.audioPlayer.play().catch(err => {
            console.log("Autoplay prevented. Prompting user for interaction.");
            this.promptForAudioPermission();
        });
    }

    /**
     * Prompt user to enable audio playback
     */
    private promptForAudioPermission(): void {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        // Create prompt box
        const promptBox = document.createElement("div");
        promptBox.style.background = "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)";
        promptBox.style.border = "3px solid #00acc1";
        promptBox.style.borderRadius = "16px";
        promptBox.style.padding = "30px 40px";
        promptBox.style.maxWidth = "400px";
        promptBox.style.textAlign = "center";
        promptBox.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
        promptBox.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

        // Add content
        promptBox.innerHTML = `
            <h2 style="color: #00838f; margin: 0 0 16px 0; font-size: 24px;">Enable Audio Narration?</h2>
            <p style="color: #006064; margin: 0 0 24px 0; line-height: 1.6; font-size: 16px;">
                This tutorial includes audio narration to enhance your learning experience.
            </p>
            <button id="enable-audio-btn" style="
                background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%);
                color: white;
                border: none;
                padding: 14px 32px;
                font-size: 16px;
                font-weight: 700;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 131, 143, 0.3);
                transition: all 0.3s ease;
            ">Enable Audio</button>
        `;

        overlay.appendChild(promptBox);
        document.body.appendChild(overlay);

        // Add button hover effect
        const button = document.getElementById("enable-audio-btn")!;
        button.addEventListener("mouseenter", () => {
            button.style.transform = "translateY(-2px)";
            button.style.boxShadow = "0 6px 16px rgba(0, 131, 143, 0.4)";
        });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "translateY(0)";
            button.style.boxShadow = "0 4px 12px rgba(0, 131, 143, 0.3)";
        });

        // Handle button click
        button.addEventListener("click", () => {
            this.audioPlayer.play().catch(err => {
                console.warn("Audio playback still blocked:", err);
            });
            document.body.removeChild(overlay);
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

    constructor(elementID: string, onClick: () => void) {
        // Get the button element
        const buttonElement = document.getElementById(elementID);
        if (!buttonElement) {
            throw new Error(`Button element with ID "${elementID}" not found.`);
        }
        this.element = buttonElement;

        // Attach click event listener
        this.element.addEventListener("click", () => {
            if (this.isEnabled) {
                this.createRipple();
                onClick();
            }
        });

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

    constructor() {}

    /**
     * Initialize the audio element reference
     */
    public setAudioElement(elementID: string): void {
        // Ensure the element exists
        if (document.getElementById(elementID) === null) {
            throw new Error(`Audio element with ID "${elementID}" not found.`);
        }
        // Stop the audio if already playing
        if (this.audioElement)
            this.stop();
        // Get the audio element
        this.audioElement = document.getElementById(elementID) as HTMLAudioElement;
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
    }
}