/**
 * Start Menu
 */
class Scene14 extends Scene {
    protected directoryHeader: string = "Thank you!";
    protected sceneName: string = "Thank you for completing this tutorial";

    protected sceneObjectives: { [key: string]: boolean } = {
        "narration-complete": false,
    }

    protected startScene(): void {
        this.audioPlayer.play();
    }

    constructor() {
        super();

        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;

        const imageBox1 = document.getElementById("image-box-1")!;
        const imageBox2 = document.getElementById("image-box-2")!;

        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 3.2,
                    callback: () => {
                        imageBox2.classList.add("visible");
                    },
                },
                {
                    timestamp: 14.3,
                    callback: () => {
                        imageBox1.classList.add("visible");
                    },
                },
            ],
            () => {
                this.updateObjectivesAndProgress("narration-complete");
            }
        )
    }
}

// Initialize the scene
new Scene14();