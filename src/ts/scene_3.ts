/**
 * Start Menu
 */
class Scene3 extends Scene {
    protected directoryHeader: string = "Habitat: Backyard Habitat";
    protected sceneName: string = "Backyard Habitats in Tampa Bay"

    protected sceneObjectives: { [key: string]: boolean } = {
        "narration-completed": false,
        "infoBox1Viewed": false,
        "infoBox2Viewed": false,
        "infoBox3Viewed": false,
    }

    private infoBoxes: HTMLElement[] = [];

    constructor() {
        super();

        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;

        this.setupAudioPlaying();
        this.initializeButtons();
        this.disableInteractions();
    }

    protected startScene(): void { this.audioPlayer.play(); }

    private setupAudioPlaying(): void {
        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [],
            () => {
                this.updateObjectivesAndProgress("narration-completed");
                this.enableInteractions();
            }
        )
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
        // Toggle info box visibility
        const infoBox = this.infoBoxes[button_index];
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
}

// Initialize the scene
new Scene3();