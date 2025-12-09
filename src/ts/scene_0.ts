/**
 * Start Menu
 */
class Scene0 extends Scene {
    protected directoryHeader: string = "Introduction";
    protected sceneName: string = "Test 1"
    protected description: string = "Test info";

    constructor() {
        super();
        this.initializeButtons();
    }

    private hideAllInfoBoxes(exception: HTMLElement | null = null): void {
        const infoBoxes = document.querySelectorAll(".info-box");
        infoBoxes.forEach(
            box => {
                if (box !== exception) 
                {
                    box.classList.remove("visible")
                }
        });
    }

    private initializeButtons(): void {
        // Get info box element
        const infoBox1 = document.getElementById("info-box-1");
        const infoBox2 = document.getElementById("info-box-2");
        const infoBox3 = document.getElementById("info-box-3");
        const infoBox4 = document.getElementById("info-box-4");

        // Initialize buttons with example callbacks
        new SingleClickButton("button-1", () => {
            console.log("Button 1 clicked!");
            if (infoBox1) {
                this.hideAllInfoBoxes(infoBox1);
                infoBox1.classList.toggle("visible");
            }
        });

        new SingleClickButton("button-2", () => {
            console.log("Button 2 clicked!");
            if (infoBox2) {
                this.hideAllInfoBoxes(infoBox2);
                infoBox2.classList.toggle("visible");
            }
        });

        new SingleClickButton("button-3", () => {
            console.log("Button 3 clicked!");
            if (infoBox3) {
                this.hideAllInfoBoxes(infoBox3);
                infoBox3.classList.toggle("visible");
            }
        });

        new SingleClickButton("button-4", () => {
            console.log("Button 4 clicked!");
            if (infoBox4) {
                this.hideAllInfoBoxes(infoBox4);
                infoBox4.classList.toggle("visible");
            }
        });
    }
}

// Initialize the scene
new Scene0();