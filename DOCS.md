# THE DOCS:

## .NOVEL FILES
These files are in fact just an JSON array. Please keep the array unless you don't want text in your novel (why?).

When the engine gets to the end of the array, it will move the user back to the home screen. If you don't want to end so suddenly, please remember to put the `Scene!` component.

## COMPONENTS

Components are the actions and descriptors of your novel. 
Your novel has text, characters with name, characters, and choices. 
You need to set components to give your novel shape. 
Please insert them in order, or it will break and explode.

Novel components go in the following order:
- Bg!
- Audio!
- Name!
- Image!
- Button!
- Scene!
- Noname!
- Nochar!
- etc...?

All components end with a ! (bang!). The button one has a \<parameter\>

### Bg! 
Structure: `Bg!(directory)`
Sets the site's background image. By default a /images/bg/ directory is made for this.

### Audio!
Structure: `Audio!(directory)`
Sets the site's background music. You can use /resources/soundtracks for it.

### Name!
Structure: `Name!(string)`

Sets a name to the character thats speaking.
Must be set when creating a novel file. 

### Image!
Structure: `Image!(directory)`

Sets the character's image. 

### Button!
Structure: `Button!(string<directory>)` OR `Button!(string<continue>)`

Creates a choice.

\<directory\> must point to a .novel file.

If \<continue\> is present, it will use the same file.

### Scene!
Structure: `Scene!(directory)`

Changes the file which is being read.

### Noname!
Structure: `Noname!`

Deletes the name component.

### Nochar! (not implemented yet)