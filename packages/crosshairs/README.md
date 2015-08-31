# Crosshairs package

Vertical column highlight for each cursor.
To get the full effect of having crosshairs on your cursor
use a theme that highlights the cursor line or style your own
with `.line.cursor-line, .line-number.cursor-line-no-selection {...}`.

The default styling is for dark backgrounds.
For lighter backgrounds add something like this to _Your Stylesheet_:

```
.editor.is-focused {
  .crosshair {
    background-color: blue;
  }
}
```

![](https://f.cloud.github.com/assets/4348/2342265/58e9c88c-a4f2-11e3-9197-2d9f9c0ebb87.png)
