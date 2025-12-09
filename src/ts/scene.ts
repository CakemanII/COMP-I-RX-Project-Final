/**
 * Basic Generic scene class 
 */
abstract class Scene {
    protected abstract directoryHeader: string;
    protected abstract sceneName: string
    protected abstract description: string;

    protected abstract maxProgress: number;
    protected abstract sceneObjectives: { [key: string]: boolean };

    constructor() {
        this.initializeCommunication();
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