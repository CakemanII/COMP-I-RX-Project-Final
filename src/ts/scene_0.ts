/**
 * Start Menu
 */
class Scene0 extends Scene {
    protected directoryHeader: string = "Introduction";
    protected sceneName: string = "Test 1"
    protected description: string = "Test info";

    constructor() {
        super();
    }
}

class Button {
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

// Add ripple animation to document
const style = document.createElement("style");
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the scene
new Scene0();

// Initialize buttons with example callbacks
new Button("button-1", () => console.log("Button 1 clicked!"));
new Button("button-2", () => console.log("Button 2 clicked!"));
new Button("button-3", () => console.log("Button 3 clicked!"));
new Button("button-4", () => console.log("Button 4 clicked!"));