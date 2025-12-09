/**
 * Start Menu
 */
class Scene0 extends Scene {
    protected directoryHeader: string = "Introduction";
    protected sceneName: string = "Test 1"
    protected description: string = "Test info";

    protected maxProgress: number = 4;
    protected sceneObjectives: { [key: string]: boolean } = {
        "infoBox1Viewed": false,
        "infoBox2Viewed": false,
        "infoBox3Viewed": false,
        "infoBox4Viewed": false
    }

    private infoBoxes: HTMLElement[] = [];

    constructor() {
        super();
        this.initializeButtons();
    }

    /**
     * Hide all info boxes except the exception
     */
    private hideAllInfoBoxes(exception: HTMLElement | null = null): void {
        const infoBoxes = document.querySelectorAll(".info-box");
        infoBoxes.forEach(box => {
            if (box !== exception) 
            {
                box.classList.remove("visible")
            }
        });
    }

    /**
     * Initialize the scene buttons and their callbacks.
     */
    private initializeButtons(): void {
        // Get info box element
        this.infoBoxes = [
            document.getElementById("info-box-1")!,
            document.getElementById("info-box-2")!,
            document.getElementById("info-box-3")!,
            document.getElementById("info-box-4")!
        ]

        // Initialize buttons with example callbacks
        new SingleClickButton("button-1", () => { this.buttonClicked(0); });
        new SingleClickButton("button-2", () => { this.buttonClicked(1); });
        new SingleClickButton("button-3", () => { this.buttonClicked(2); });
        new SingleClickButton("button-4", () => { this.buttonClicked(3); });
    }

    /**
     * Button clicked
     */
    private buttonClicked(button_index: number): void {
        console.log(`Button ${button_index} clicked!`);
        const infoBox = this.infoBoxes[button_index];

        this.hideAllInfoBoxes(infoBox);
        this.updateObjectivesAndProgress(`infoBox${button_index + 1}Viewed`);
        infoBox.classList.toggle("visible");
    }
}

// Initialize the scene
new Scene0();