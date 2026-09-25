# Media drop folder

Files here are served as-is at `/media/<filename>` — no build step, no import.

## Agent UI Execution Engine

The featured-work card (`src/data/content.js`, `featuredWork[0].media`) expects:

```
public/media/agent-ui-execution-engine.mp4
```

Drop the file in and it appears on the next deploy — no code change needed.

If you'd rather use a GIF, put it at `agent-ui-execution-engine.gif` instead and
update that entry's `media` to:

```js
media: { type: "gif", src: "/media/agent-ui-execution-engine.gif", alt: "..." },
```
