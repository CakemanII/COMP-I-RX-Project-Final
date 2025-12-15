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

        const infoBox2 = document.getElementById("info-box-2")!;
        const imageBox2 = document.getElementById("image-box-2")!;

        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 16.5,
                    callback: () => {
                        imageBox2.classList.add("visible");
                    },
                },
                {
                    timestamp: 20.0,
                    callback: () => {
                        infoBox2.classList.add("visible");
                    }
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