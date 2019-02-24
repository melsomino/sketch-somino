# Somino Sketch
Set of useful abilities:
- Dialogless export of selected artboards by single key press.
- Attachable Styles.
- Advanced Clipboard.

# Install
1. Download [master.zip](https://github.com/melsomino/sketch-somino/archive/master.zip).
2. Extract downloaded archive.
3. Goto extracted folder and open `Somino.sketchplugin`.

# Usage
## Settings
Before you start use somino you need to  prepare you sketch file:
1. Add a page named "Somino" to you file.
2. Add an empty artboard with any name to "Somino" page.
3. Add a text element (layer) on this artboard and name it "settings".
4. The text of this element contains settings in format:
    ```
    silent_path=path to folder where silent export will place images
    ``` 
 
## Silent Export

:heavy_exclamation_mark: Before use silent export ensure that you have done with settings as described above.

Select one or more artboards and press `⌃⇧E`.
If none selected then all artboards from the current page will be exported.

## Attachable Styles

You can setup a list of shapes and use its decorations (fills, borders, shadows etc.) as a style provider for other elements. 

### Define style providing shape
1. Goto 'Somino' page and place some shape on it (e.g. rectangle).
2. Setup borders, fills, shadows and other decorations.
3. Set name for this shape in format:
    `name: options`, where `name` is a name for attachable style and `options` is a set of decorations for provided style elements:
    - `border` or `br` – style provides a border settings.
    - `fill` or `fl` – style provides a fill settings.
    - `shadow` or `sh` – style provides a shadow settings.

You can define as many shapes/styles as you need.

### Use defined styles
1. Go to you working page and select element for which you want to apply a previously defined style.
2. Run menu command `Plugins → Somino → Attach Style`. You will see a dialog with defined styles.
3. Choose style from the list and press `Ok`.
4. The decoration of a selected element will change according to a chosen style.
5. The chosen style will be 'attached' to selected element (layer).

### Update style definition
1. Goto 'Somino' page and select shape which define style.
2. Modify decoration properties.
3. Run menu command `Plugins → Somino → Apply Style`.
4. All elements which are attached to this style will be updated according to new parameters.

### Show styles attached to element
1. Go to you working page and select element for which you want to display attached styles.
2. Run menu command `Plugins → Somino → Show Style`.
3. You will see a list of attached styles in popup message.
 
### Detach style
1. Go to you working page and select element for which you want to detach styles.
2. Run menu command `Plugins → Somino → Detach Style`. You will see a dialog with attached styles.
3. Choose style you want to detach from the list and press `Ok`.
4. The chosen style will be 'detached' from selected element (layer).
 
## Advanced Clipboard Operations

With Somino Advanced Clipboard you can copy all properties of selected element to clipboard. Run menu command `Plugins → Somino → Copy Style & Shapes`.

Then you can paste only a particular parts of copied content. 

Select element(s) to which you want to apply copied properties and run one of menu command `Plugins → Somino → Paste <part>` where <part> can be one of the `Borders`, `Fills`, `Shadows` or `Shapes`.

Only chosen decorations of selected elements will be replaced.

If you select `Paste Shapes` then all shapes of selected element will be replaced with shapes of copied element.  
