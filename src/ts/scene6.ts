/**
 * Start Menu
 */
class Scene6 extends Scene {
    protected directoryHeader: string = "Growing Emergency!";
    protected sceneName: string = "Rising Sea Levels are very urgent"

    protected sceneObjectives: { [key: string]: boolean } = {
        "narration-complete": false,
    }

    protected startScene(): void {
        this.audioPlayer.play();
    }

    constructor() {
        super();

        this.maxProgress = Object.keys(this.sceneObjectives).length;

        const infoBox1 = document.getElementById("info-box-1")!;
        const imageBox1 = document.getElementById("image-box-1")!;
        const imageBox2 = document.getElementById("image-box-2")!;

        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 0.5,
                    callback: () => {
                        infoBox1.classList.add("visible");
                    },
                },
                {
                    timestamp: 5.0,
                    callback: () => {
                        imageBox1.classList.add("visible");
                    },
                },
                {
                    timestamp: 10.0,
                    callback: () => {
                        imageBox2.classList.add("visible");
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
new Scene6();