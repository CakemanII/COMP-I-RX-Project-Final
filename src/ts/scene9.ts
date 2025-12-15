/**
 * Start Menu
 */
class Scene9 extends Scene {
    protected directoryHeader: string = "Sea Walls";
    protected sceneName: string = "Solution 2: Sea Walls"

    protected sceneObjectives: { [key: string]: boolean } = {
        "initial-narration-completed": false,
        "infoBox1Viewed": false,
        "infoBox2Viewed": false,
        "infoBox3Viewed": false,
    }

    protected startScene(): void {
        this.audioPlayer.play();
    }

    private infoBoxesForButtons: HTMLElement[] = [];

    constructor() {
        super();

        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;
        
        this.initializeButtons();
        this.disableInteractions();

        const button1 = document.getElementById("button-1")!;
        const button2 = document.getElementById("button-2")!;
        const button3 = document.getElementById("button-3")!;
        
        // Hide buttons initially
        button1.style.display = "none";
        button2.style.display = "none";
        button3.style.display = "none";

        this.audioPlayer.setAudioElement(
            "initial-narration",
            [
                {
                    timestamp: 0.5,
                    callback: () => {
                        // Show buttons with fade in animation
                        button1.style.display = "flex";
                        button2.style.display = "flex";
                        button3.style.display = "flex";
                        button1.style.animation = "fadeIn 0.3s ease-out";
                        button2.style.animation = "fadeIn 0.3s ease-out";
                        button3.style.animation = "fadeIn 0.3s ease-out";
                    }
                }
            ],
            () => {
                this.updateObjectivesAndProgress("initial-narration-completed");
                this.enableInteractions();
            }
        )
    }

    /**
     * Hide all info boxes except the exception
     */
    private hideAllInfoBoxes(exception: HTMLElement | null = null): void {
        const infoBoxes = document.querySelectorAll(".info-box");
        infoBoxes.forEach(box => {
            if (box !== exception && box.id !== "info-box-0") 
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
        this.infoBoxesForButtons = [
            document.getElementById("info-box-1")!,
            document.getElementById("info-box-2")!,
            document.getElementById("info-box-3")!,
        ]

        // Initialize buttons with example callbacks
        new SingleClickButton("button-1", true, () => { this.buttonClicked(0); });
        new SingleClickButton("button-2", true, () => { this.buttonClicked(1); });
        new SingleClickButton("button-3", true, () => { this.buttonClicked(2); });
    }

    /**
     * Button clicked
     */
    private buttonClicked(button_index: number): void {
        console.log(`Button ${button_index} clicked!`);

        // Toggle info box visibility
        const infoBox = this.infoBoxesForButtons[button_index];
        this.hideAllInfoBoxes(infoBox);

        // Toggle visibility
        infoBox.classList.toggle("visible");

        // Do not continue if not visible or already viewed
        if (
            !infoBox.classList.contains("visible") || 
            this.sceneObjectives[`infoBox${button_index + 1}Viewed`] === true
        ) { return; }

        // Disable Interactions
        this.disableInteractions();

        // Play audio if clicking for the first time
        this.audioPlayer.setAudioElement(
            `dialogue-narration-${button_index + 1}`,
            [],
            () => { 
                this.enableInteractions();
                this.updateObjectivesAndProgress(`infoBox${button_index + 1}Viewed`);
            }  // Re-enable interactions after audio ends
        );
        this.audioPlayer.play();
    }
}

// Initialize the scene
new Scene9();