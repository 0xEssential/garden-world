export function closeButton(
  scene: Phaser.Scene,
  hudContainer: Phaser.GameObjects.Container,
  hudBackground: Phaser.GameObjects.Rectangle
) {
  const closeButton = scene.add.image(
    hudBackground.width / 2 - 18,
    18,
    "closeButton"
  );

  closeButton.setDisplaySize(18, 18); // Set the desired width and height of the button

  // Set the close button to be interactive and clickable
  closeButton.setInteractive({ useHandCursor: true });

  // Register onClick event for the close button
  closeButton.on("pointerup", () => {
    hudContainer.setVisible(false);
  });

  // Add the close button to the HUD container
  hudContainer.add(closeButton);
}

export function alignToTopOfContainer(
  child: any,
  container: any,
  padding: number
) {
  const minY = container.y;
  child.y = minY + padding;
}
