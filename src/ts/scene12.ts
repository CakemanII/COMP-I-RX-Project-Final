/**
 * Start Menu
 */
class Scene12 extends Scene {
    protected directoryHeader: string = "Take Action";
    protected sceneName: string = "How can you save Tampa Bay?"

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

        const infoBox1 = document.getElementById("info-box-1")!;
        const infoBox2 = document.getElementById("info-box-2")!;
        const infoBox3 = document.getElementById("info-box-3")!;
        const imageBox1 = document.getElementById("image-box-1")!;
        const imageBox2 = document.getElementById("image-box-2")!;
        const imageBox3 = document.getElementById("image-box-3")!;

        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 0.5,
                    callback: () => {
                        infoBox1.classList.add("visible");
                        imageBox1.classList.add("visible");
                    },
                },
                {
                    timestamp: 5.0,
                    callback: () => {
                        infoBox2.classList.add("visible");
                        imageBox2.classList.add("visible");
                    },
                },
                {
                    timestamp: 10.0,
                    callback: () => {
                        infoBox3.classList.add("visible");
                        imageBox3.classList.add("visible");
                    },
                }
            ],
            () => {
                this.updateObjectivesAndProgress("narration-complete");
            }
        )
    }
}

// Initialize the scene
new Scene12();