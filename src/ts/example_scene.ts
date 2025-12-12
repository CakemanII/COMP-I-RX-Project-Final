/**
 * Start Menu
 */
class ExampleScene extends Scene {
    protected directoryHeader: string = "Introduction";
    protected sceneName: string = "Test 2"

    protected maxProgress: number = 6;
    protected sceneObjectives: { [key: string]: boolean } = {
        "infoBox1Viewed": false,
        "infoBox2Viewed": false,
        "infoBox3Viewed": false,
        "infoBox4Viewed": false,
        "dragTask1Completed": false,
        "dragTask2Completed": false
    }

    protected startScene(): void {
        
    }

    private infoBoxes: HTMLElement[] = [];

    constructor() {
        super();
        this.initializeButtons();
        this.initializeDragAndDrop();
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
        new SingleClickButton("button-1", true, () => { this.buttonClicked(0); });
        new SingleClickButton("button-2", true, () => { this.buttonClicked(1); });
        new SingleClickButton("button-3", true, () => { this.buttonClicked(2); });
        new SingleClickButton("button-4", true, () => { this.buttonClicked(3); });
    }

    /**
     * Button clicked
     */
    private buttonClicked(button_index: number): void {
        console.log(`Button ${button_index} clicked!`);

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
            "narration-one",
            [],
            () => { 
                this.enableInteractions();
                this.updateObjectivesAndProgress(`infoBox${button_index + 1}Viewed`);
            }  // Re-enable interactions after audio ends
        );
        this.audioPlayer.play();
    }

    /**
     * Initialize drag and drop example
     */
    private initializeDragAndDrop(): void {
        // Create draggable elements
        const draggableItem1 = new DraggableElement("drag-item-1");
        const draggableItem2 = new DraggableElement("drag-item-2");

        // Both items participate in both zones
        const allDraggables = [draggableItem1, draggableItem2];

        // Create drop zone 1 (accepts item 1)
        const dropZone1 = new DraggablePlaceSpot(
            "drop-zone-1",
            allDraggables,
            draggableItem1,
            () => {
                console.log("Correct! Red item placed in Zone A.");
                this.updateObjectivesAndProgress("dragTask1Completed");
            },
            () => {
                console.log("Incorrect placement. Try again!");
            }
        );
        dropZone1.setSnapRadius(80);

        // Create drop zone 2 (accepts item 2)
        const dropZone2 = new DraggablePlaceSpot(
            "drop-zone-2",
            allDraggables,
            draggableItem2,
            () => {
                console.log("Correct! Teal item placed in Zone B.");
                this.updateObjectivesAndProgress("dragTask2Completed");
            },
            () => {
                console.log("Incorrect placement. Try again!");
            }
        );
        dropZone2.setSnapRadius(80);
    }
}

// Initialize the scene
new Scene1();