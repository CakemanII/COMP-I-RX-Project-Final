/**
 * Start Menu
 */
class Scene1 extends Scene {
    protected directoryHeader: string = "Water is Rising?";
    protected sceneName: string = "What causes sea levels and water levels to rise?"

    protected sceneObjectives: { [key: string]: boolean } = {
        "intro-narration-completed": false,
        "dialogue-1-completed": false,
        "dialogue-2-completed": false,
        "dialogue-3-completed": false,
        "dialogue-4-completed": false,
    }

    constructor() {
        super();
        
        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;

        this.setupAudioPlaying();

        this.initializeButtons();
    }

    protected startScene(): void { 
        this.audioPlayer.play(); 
    }

    private initializeButtons(): void {
        new SingleClickButton("question-button-1", true, () => {
            this.dialogueSequence("dialogue-overlay-1");
        });
        new SingleClickButton("question-button-2", true, () => {
            this.dialogueSequence("dialogue-overlay-2");
        });
        new SingleClickButton("question-button-3", true, () => {
            this.dialogueSequence("dialogue-overlay-3");
        });
        new SingleClickButton("question-button-4", true, () => {
            this.dialogueSequence("dialogue-overlay-4");
        });
    }

    private dialogueSequence(overlay_id: string) {
        // Get the dialogue completed objective
        let dialogueNumber: number = -1;
        switch (overlay_id) {
            case "dialogue-overlay-1":
                dialogueNumber = 1;
                break;
            case "dialogue-overlay-2":
                dialogueNumber = 2;
                break;
            case "dialogue-overlay-3":
                dialogueNumber = 3;
                break;
            case "dialogue-overlay-4":
                dialogueNumber = 4;
                break;
            default:
                console.error(`Invalid dialogue overlay ID: ${overlay_id}`);
                return;
        }

        // Set the question mark button to a different image.
        if (!this.sceneObjectives[`dialogue-${dialogueNumber}-completed`]) {
            const questionElement = document.getElementById(`question-mark-${dialogueNumber}`) as HTMLButtonElement;    
            const questionImage = questionElement.querySelector("img") as HTMLImageElement;
            
            let image = ""
            switch (dialogueNumber) {
                case 1:
                    image = "../media/scene_1/flooding.jpg";
                    break;
                case 2:
                    image = "../media/scene_1/storm_surge.jpg";
                    break;
                case 3:
                    image = "../media/scene_1/climate_change.jpg";
                    break;
                case 4:
                    image = "../media/scene_1/hurricane.png";
                    break;
                default:
                    console.error(`Invalid dialogue number: ${dialogueNumber}`);
                    return;
            }
            questionImage.src = image;
        }

        // Initialize dialogue overlay
        const dialogue = new DialogueOverlay(overlay_id);
        dialogue.setCanExit(false);
        dialogue.show();

        if (this.sceneObjectives[`dialogue-${dialogueNumber}-completed`]) {
            dialogue.setCanExit(true);
            return; // Already completed
        }

        // Play the audio
        this.audioPlayer.setAudioElement(
            `dialogue-narration-${dialogueNumber}`, 
            [],
            () => {
                console.log(`Dialogue ${dialogueNumber} audio completed`);
                dialogue.setCanExit(true);
                this.updateObjectivesAndProgress(`dialogue-${dialogueNumber}-completed`);
            }
        )
        this.audioPlayer.play();
    }

    /** 
     * Setup the audio to play after user interaction
     */
    private setupAudioPlaying(): void {
        console.log("Setting up initial narration audio");
        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 3,
                    callback: () => {
                        // Show images
                        const questionImages = document.getElementsByClassName("image-box");
                        for (let i = 0; i < questionImages.length; i++) {
                            const img = questionImages[i] as HTMLImageElement;
                            img.classList.add("visible");
                        }
                    }
                }
            ],
            () => {
                this.updateObjectivesAndProgress("intro-narration-completed");

                // Activate all four question buttons and images
                const questionButtons = document.getElementsByClassName("invisible-button");
                for (let i = 0; i < questionButtons.length; i++) {
                    const button = questionButtons[i] as HTMLButtonElement;
                    button.classList.add("active");
                    button.style.display = "block";
                }
            }
        )
    }
}

// Initialize the scene
new Scene1();