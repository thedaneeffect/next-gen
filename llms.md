# Melt UI

> Melt UI is a headless UI component library for Svelte 5. It provides accessible, unstyled components via class-based builders or Svelte components, using runes (`$state`, `$derived`, `$effect`) for reactivity. Install with `npm install melt`.

## Important Concepts

### Two APIs: Builders and Components

**Builders** are class instances that return spread attributes. Use in `.svelte` or `.svelte.ts` files:

```svelte
<script lang="ts">
  import { Toggle } from "melt/builders";

  let value = $state(false);
  const toggle = new Toggle({
    value: () => value,
    onValueChange: (v) => (value = v),
  });
</script>

<button {...toggle.trigger}>
  {toggle.value ? "On" : "Off"}
</button>
```

**Components** wrap builders and support `bind:` directive:

```svelte
<script lang="ts">
  import { Toggle } from "melt/components";

  let value = $state(false);
</script>

<Toggle bind:value>
  {#snippet children(toggle)}
    <button {...toggle.trigger}>
      {toggle.value ? "On" : "Off"}
    </button>
  {/snippet}
</Toggle>
```

### MaybeGetter Pattern

Props accept static values OR getter functions for reactivity:

```ts
// Static - never changes
const toggle = new Toggle({ disabled: false });

// Reactive - updates when `disabled` changes
let disabled = $state(false);
const toggle = new Toggle({ disabled: () => disabled });
```

Type: `MaybeGetter<T> = T | (() => T)`

### Controlled vs Uncontrolled

**Uncontrolled** (default): Component manages its own state internally.

```ts
const toggle = new Toggle();
toggle.value; // managed internally
```

**Controlled**: You manage state externally via getter + callback:

```ts
let isEnabled = $state(false);
const toggle = new Toggle({
  value: () => isEnabled,
  onValueChange: (v) => (isEnabled = v),
});
```

### Merging Attributes

When adding custom handlers, use `mergeAttrs` to avoid overriding builder handlers:

```svelte
<script>
  import { mergeAttrs } from "melt";
</script>

<!-- WRONG: onclick overrides popover.trigger's onclick -->
<button {...popover.trigger} onclick={() => console.log("hi")}>

<!-- CORRECT: both handlers run -->
<button {...mergeAttrs(popover.trigger, { onclick: () => console.log("hi") })}>
```

### Styling

Components expose `data-melt-*` attributes and state attributes for CSS:

```css
/* Target by component */
[data-melt-toggle-trigger] { }

/* Target by state */
[data-melt-toggle-trigger][data-checked] { background: blue; }
[data-melt-slider-root][data-dragging] { }
[data-melt-collapsible-trigger][data-disabled] { }
```

CSS variables for positioning:
- `--percentage` / `--percentage-inv` (Slider)
- `--progress` / `--neg-progress` (Progress)
- `--melt-invoker-width/height/x/y` (floating elements)

### Floating UI Integration

Popover, Tooltip, Select, and Combobox use Floating UI. Configure via `floatingConfig`:

```ts
const popover = new Popover({
  floatingConfig: {
    placement: "bottom-start",
    offset: 8,
  },
});
```

---

## Components

### Accordion

Expandable/collapsible content sections with keyboard navigation.

```svelte
<script lang="ts">
  import { Accordion, type AccordionItem } from "melt/builders";

  type Item = AccordionItem<{ title: string; description: string }>;

  const items: Item[] = [
    { id: "item-1", title: "What is it?", description: "A headless UI library" },
    { id: "item-2", title: "Can I customize it?", description: "Yes, 100%" },
  ];

  const accordion = new Accordion();
</script>

<div {...accordion.root}>
  {#each items as i}
    {@const item = accordion.getItem(i)}
    <h2 {...item.heading}>
      <button {...item.trigger}>{item.item.title}</button>
    </h2>
    {#if item.isExpanded}
      <div {...item.content}>{item.item.description}</div>
    {/if}
  {/each}
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiple` | `MaybeGetter<boolean>` | `false` | Allow multiple items open |
| `disabled` | `MaybeGetter<boolean>` | `false` | Disable all interaction |
| `value` | `MaybeMultiple<string, Multiple>` | - | Controlled expanded item(s) |
| `onValueChange` | `(value) => void` | - | Called when expansion changes |

**Methods:**
- `getItem(item)` - Get item with spread attributes
- `isExpanded(id)` - Check if item is expanded
- `expand(id)` / `collapse(id)` / `toggleExpanded(id)` - Control expansion

**Spread Attributes:**
- `accordion.root` - Root container
- `item.heading` - Heading wrapper (h2, h3, etc.)
- `item.trigger` - Button to toggle
- `item.content` - Collapsible content

---

### Avatar

Image with fallback for representing users.

```svelte
<script lang="ts">
  import { Avatar } from "melt/builders";

  const avatar = new Avatar({ src: "https://example.com/photo.jpg" });
</script>

<img {...avatar.image} alt="User avatar" />
<span {...avatar.fallback}>JD</span>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `MaybeGetter<string>` | - | Image source URL |
| `delayMs` | `MaybeGetter<number>` | `0` | Delay before showing image (avoid flash) |
| `onLoadingStatusChange` | `(status) => void` | - | Called when loading status changes |

**Properties:**
- `loadingStatus` - `"loading" | "loaded" | "error"`

**Spread Attributes:**
- `avatar.image` - The img element (hidden until loaded)
- `avatar.fallback` - Fallback content (hidden when image loads)

---

### Collapsible

Simple expand/collapse panel.

```svelte
<script lang="ts">
  import { Collapsible } from "melt/builders";

  const collapsible = new Collapsible();
</script>

<button {...collapsible.trigger}>Toggle</button>
{#if collapsible.open}
  <div {...collapsible.content}>Content here</div>
{/if}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `MaybeGetter<boolean>` | `false` | Whether open |
| `disabled` | `MaybeGetter<boolean>` | `false` | Disable interaction |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open changes |

**Properties:**
- `open` - Current open state (readable/writable)

**Spread Attributes:**
- `collapsible.trigger` - Button to toggle
- `collapsible.content` - Content panel

---

### Combobox

Filterable select with text input, supports multi-select.

```svelte
<script lang="ts">
  import { Combobox } from "melt/builders";

  const options = ["Apple", "Banana", "Cherry"] as const;
  type Option = (typeof options)[number];

  const combobox = new Combobox<Option>();

  const filtered = $derived.by(() => {
    if (!combobox.touched) return options;
    return options.filter((o) =>
      o.toLowerCase().includes(combobox.inputValue.trim().toLowerCase())
    );
  });
</script>

<label {...combobox.label}>Fruit</label>
<input {...combobox.input} />
<button {...combobox.trigger}>Open</button>

<div {...combobox.content}>
  {#each filtered as option}
    <div {...combobox.getOption(option)}>
      {option}
      {#if combobox.isSelected(option)}✓{/if}
    </div>
  {:else}
    <span>No results</span>
  {/each}
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `MaybeGetter<boolean>` | `false` | Whether dropdown is open |
| `multiple` | `MaybeGetter<boolean>` | `false` | Allow multiple selections |
| `value` | `MaybeMultiple<T, Multiple>` | - | Selected value(s) |
| `inputValue` | `MaybeGetter<string>` | `""` | Text input value |
| `highlighted` | `MaybeGetter<T \| null>` | - | Currently highlighted option |
| `floatingConfig` | `UseFloatingConfig` | - | Floating UI config |
| `sameWidth` | `MaybeGetter<boolean>` | `true` | Match trigger width |
| `closeOnEscape` | `MaybeGetter<boolean>` | `true` | Close on Escape key |
| `closeOnOutsideClick` | `boolean \| ((el) => boolean)` | `true` | Close on outside click |
| `scrollAlignment` | `"nearest" \| "center" \| null` | `"nearest"` | Scroll behavior |
| `onValueChange` | `(value) => void` | - | Called when value changes |
| `onInputValueChange` | `(value) => void` | - | Called when input changes |
| `onHighlightChange` | `(value) => void` | - | Called when highlight changes |
| `onNavigate` | `(current, direction) => T` | - | Custom navigation (virtualization) |

**Properties:**
- `value` - Selected value(s)
- `inputValue` - Current input text
- `highlighted` - Currently highlighted option
- `touched` - Whether input has been modified

**Methods:**
- `getOption(value, label?)` - Get option attributes
- `isSelected(value)` - Check if option is selected
- `select(value)` - Select an option
- `highlight(value)` - Highlight an option
- `highlightNext()` / `highlightPrev()` / `highlightFirst()` / `highlightLast()`

**Spread Attributes:**
- `combobox.label` - Label element
- `combobox.input` - Text input
- `combobox.trigger` - Dropdown trigger button
- `combobox.content` - Dropdown content
- `combobox.getOption(value)` - Individual option

---

### Dialog

Modal dialog that interrupts the user with important content.

```svelte
<script lang="ts">
  import { Dialog } from "melt/builders";

  const dialog = new Dialog();
</script>

<button {...dialog.trigger}>Open Dialog</button>

<dialog {...dialog.content}>
  <h2 {...dialog.title}>Dialog Title</h2>
  <p {...dialog.description}>Dialog content here.</p>
  <button {...dialog.close}>Close</button>
</dialog>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `MaybeGetter<boolean>` | `false` | Whether open |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open changes |
| `closeOnEscape` | `MaybeGetter<boolean>` | `true` | Close on Escape key |
| `closeOnOutsideClick` | `MaybeGetter<boolean>` | `true` | Close on backdrop click |
| `preventScroll` | `MaybeGetter<boolean>` | `true` | Prevent body scroll when open |
| `forceVisible` | `MaybeGetter<boolean>` | `false` | Keep visible for exit animations |

**Properties:**
- `open` - Current open state (readable/writable)

**Spread Attributes:**
- `dialog.trigger` - Button to open
- `dialog.content` - The `<dialog>` element
- `dialog.close` - Button to close
- `dialog.title` - Title element (for `aria-labelledby`)
- `dialog.description` - Description element (for `aria-describedby`)

---

### Alert Dialog

Modal dialog for important actions that requires explicit user response. Cannot be dismissed with Escape or backdrop click.

```svelte
<script lang="ts">
  import { AlertDialog } from "melt/builders";

  const alertDialog = new AlertDialog();
</script>

<button {...alertDialog.trigger}>Delete</button>

<dialog {...alertDialog.content}>
  <h2 {...alertDialog.title}>Are you sure?</h2>
  <p {...alertDialog.description}>This action cannot be undone.</p>
  <button {...alertDialog.cancel}>Cancel</button>
  <button {...alertDialog.action}>Delete</button>
</dialog>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `MaybeGetter<boolean>` | `false` | Whether open |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open changes |
| `preventScroll` | `MaybeGetter<boolean>` | `true` | Prevent body scroll when open |
| `forceVisible` | `MaybeGetter<boolean>` | `false` | Keep visible for exit animations |

**Properties:**
- `open` - Current open state (readable/writable)

**Spread Attributes:**
- `alertDialog.trigger` - Button to open
- `alertDialog.content` - The `<dialog>` element (role="alertdialog")
- `alertDialog.cancel` - Cancel button (closes without action)
- `alertDialog.action` - Action button (confirms and closes)
- `alertDialog.title` - Title element (for `aria-labelledby`)
- `alertDialog.description` - Description element (for `aria-describedby`)

---

### File Upload

Drag-and-drop file upload with validation.

```svelte
<script lang="ts">
  import { FileUpload } from "melt/builders";

  const fileUpload = new FileUpload({
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });
</script>

<input {...fileUpload.input} />
<div {...fileUpload.dropzone}>
  {#if fileUpload.isDragging}
    Drop files here
  {:else}
    Click or drag files
  {/if}
</div>

{#if fileUpload.selected}
  {#each [...fileUpload.selected] as file}
    <div>{file.name} <button onclick={() => fileUpload.remove(file)}>Remove</button></div>
  {/each}
{/if}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiple` | `MaybeGetter<boolean>` | `false` | Accept multiple files |
| `accept` | `MaybeGetter<string>` | - | Accepted MIME types/extensions |
| `maxSize` | `MaybeGetter<number>` | - | Max file size in bytes |
| `disabled` | `MaybeGetter<boolean>` | `false` | Disable upload |
| `selected` | `MaybeMultiple<File, Multiple>` | - | Controlled selected files |
| `validate` | `(file: File) => boolean` | - | Custom validation |
| `avoidDuplicates` | `MaybeGetter<boolean>` | `false` | Check file contents for duplicates |
| `onSelectedChange` | `(files) => void` | - | Called when selection changes |
| `onAccept` | `(file) => void` | - | Called when file is accepted |
| `onError` | `(error) => void` | - | Called on validation error |

**Properties:**
- `selected` - Currently selected file(s)
- `isDragging` - Whether file is being dragged over

**Methods:**
- `clear()` - Clear all selected files
- `remove(file)` - Remove specific file
- `has(file)` - Check if file is selected

**Spread Attributes:**
- `fileUpload.input` - Hidden file input
- `fileUpload.dropzone` - Drop zone area
- `fileUpload.trigger` - Optional trigger button

---

### PIN Input

Sequence of single-character inputs for PINs/OTPs.

```svelte
<script lang="ts">
  import { PinInput } from "melt/builders";

  const pinInput = new PinInput({
    maxLength: 6,
    type: "numeric",
    onComplete: (value) => console.log("PIN:", value),
  });
</script>

<div {...pinInput.root}>
  {#each pinInput.inputs as input}
    <input {...input} />
  {/each}
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `MaybeGetter<string>` | `""` | Current PIN value |
| `maxLength` | `MaybeGetter<number>` | `4` | Number of input fields |
| `type` | `MaybeGetter<"text" \| "numeric" \| "alphanumeric">` | `"text"` | Allowed characters |
| `mask` | `MaybeGetter<boolean>` | `false` | Hide input like password |
| `placeholder` | `MaybeGetter<string>` | `"○"` | Placeholder character |
| `disabled` | `MaybeGetter<boolean>` | `false` | Disable input |
| `allowPaste` | `MaybeGetter<boolean>` | `true` | Allow pasting values |
| `onValueChange` | `(value: string) => void` | - | Called when value changes |
| `onComplete` | `(value: string) => void` | - | Called when all fields filled |
| `onPaste` | `(value: string) => void` | - | Override paste behavior |
| `onError` | `(error) => void` | - | Called on validation error |

**Properties:**
- `value` - Current PIN string
- `isFilled` - Whether all fields are filled

**Spread Attributes:**
- `pinInput.root` - Container element
- `pinInput.inputs` - Array of input attributes (spread each)

---

### Popover

Floating content anchored to a trigger.

```svelte
<script lang="ts">
  import { Popover } from "melt/builders";

  const popover = new Popover();
</script>

<button {...popover.trigger}>Open</button>
<div {...popover.content}>
  Popover content here
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `MaybeGetter<boolean>` | `false` | Whether open |
| `forceVisible` | `MaybeGetter<boolean>` | `false` | Keep visible (for animations) |
| `sameWidth` | `MaybeGetter<boolean>` | `false` | Match trigger width |
| `closeOnEscape` | `MaybeGetter<boolean>` | `true` | Close on Escape |
| `closeOnOutsideClick` | `boolean \| ((el) => boolean)` | `true` | Close on outside click |
| `floatingConfig` | `UseFloatingConfig` | - | Floating UI config |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open changes |

**Properties:**
- `open` - Current open state

**Spread Attributes:**
- `popover.trigger` - Button to toggle
- `popover.content` - Floating content (uses native `popover` attribute)

---

### Progress

Progress bar with accessibility support.

```svelte
<script lang="ts">
  import { Progress } from "melt/builders";

  const progress = new Progress({ value: 50 });
</script>

<div {...progress.root}>
  <div {...progress.progress} />
</div>

<style>
  [data-melt-progress-progress] {
    transform: translateX(calc(var(--progress) * -1));
  }
</style>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `MaybeGetter<number>` | `0` | Current value |
| `max` | `MaybeGetter<number>` | `100` | Maximum value |
| `onValueChange` | `(value: number) => void` | - | Called when value changes |

**Properties:**
- `value` - Current progress value

**CSS Variables:**
- `--progress` - Percentage as CSS value (e.g., "50%")
- `--neg-progress` - Negative percentage

**Spread Attributes:**
- `progress.root` - Container with ARIA attributes
- `progress.progress` - Progress indicator element

---

### Radio Group

Single-select radio button group.

```svelte
<script lang="ts">
  import { RadioGroup } from "melt/builders";

  const group = new RadioGroup();
  const options = ["small", "medium", "large"];
</script>

<div {...group.root}>
  <label {...group.label}>Size</label>
  {#each options as option}
    {@const item = group.getItem(option)}
    <div {...item.attrs}>
      {#if item.checked}✓{/if}
      {option}
    </div>
  {/each}
  <input {...group.hiddenInput} />
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `MaybeGetter<string>` | `""` | Selected value |
| `disabled` | `MaybeGetter<boolean>` | `false` | Disable all items |
| `required` | `MaybeGetter<boolean>` | `false` | Required for form submission |
| `loop` | `MaybeGetter<boolean>` | `true` | Loop keyboard navigation |
| `orientation` | `MaybeGetter<"horizontal" \| "vertical">` | `"vertical"` | Layout orientation |
| `selectWhenFocused` | `MaybeGetter<boolean>` | `true` | Select item on focus |
| `name` | `MaybeGetter<string>` | - | Form input name |
| `onValueChange` | `(value: string) => void` | - | Called when value changes |

**Methods:**
- `getItem(value)` - Get item with `{ attrs, checked }`
- `select(value)` - Select an item

**Spread Attributes:**
- `group.root` - Container
- `group.label` - Label element
- `item.attrs` - Individual radio item
- `group.hiddenInput` - Hidden input for forms

---

### Select

Dropdown selection with typeahead.

```svelte
<script lang="ts">
  import { Select } from "melt/builders";

  const options = ["Apple", "Banana", "Cherry"];
  const select = new Select<string>();
</script>

<label {...select.label}>Fruit</label>
<button {...select.trigger}>
  {select.value ?? "Select..."}
</button>

<div {...select.content}>
  {#each options as option}
    <div {...select.getOption(option)}>
      {option}
      {#if select.isSelected(option)}✓{/if}
    </div>
  {/each}
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `MaybeGetter<boolean>` | `false` | Whether open |
| `multiple` | `MaybeGetter<boolean>` | `false` | Allow multiple selections |
| `value` | `MaybeMultiple<T, Multiple>` | - | Selected value(s) |
| `highlighted` | `MaybeGetter<T \| null>` | - | Currently highlighted |
| `floatingConfig` | `UseFloatingConfig` | - | Floating UI config |
| `sameWidth` | `MaybeGetter<boolean>` | `true` | Match trigger width |
| `closeOnEscape` | `MaybeGetter<boolean>` | `true` | Close on Escape |
| `closeOnOutsideClick` | `boolean \| ((el) => boolean)` | `true` | Close on outside click |
| `typeaheadTimeout` | `MaybeGetter<number>` | `500` | Typeahead reset delay (ms) |
| `scrollAlignment` | `"nearest" \| "center" \| null` | `"nearest"` | Scroll behavior |
| `onValueChange` | `(value) => void` | - | Called when value changes |
| `onHighlightChange` | `(value) => void` | - | Called when highlight changes |
| `onNavigate` | `(current, direction) => T` | - | Custom navigation |

**Properties:**
- `value` - Selected value(s)
- `highlighted` - Currently highlighted option
- `valueAsString` - Value as display string

**Methods:**
- `getOption(value, label?)` - Get option attributes
- `isSelected(value)` - Check if selected
- `select(value)` - Select an option

**Spread Attributes:**
- `select.label` - Label element
- `select.trigger` - Dropdown trigger
- `select.content` - Dropdown content
- `select.getOption(value)` - Individual option

---

### Slider

Draggable numeric input.

```svelte
<script lang="ts">
  import { Slider } from "melt/builders";

  const slider = new Slider({ value: 50 });
</script>

<div {...slider.root}>
  <div class="track">
    <div class="range" style="right: var(--percentage-inv)"></div>
    <div {...slider.thumb} style="left: var(--percentage)"></div>
  </div>
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `MaybeGetter<number>` | `0` | Current value |
| `min` | `MaybeGetter<number>` | `0` | Minimum value |
| `max` | `MaybeGetter<number>` | `100` | Maximum value |
| `step` | `MaybeGetter<number>` | `1` | Step increment |
| `orientation` | `MaybeGetter<"horizontal" \| "vertical">` | `"horizontal"` | Orientation |
| `onValueChange` | `(value: number) => void` | - | Called when value changes |

**Properties:**
- `value` - Current slider value

**CSS Variables:**
- `--percentage` - Value as percentage (e.g., "50%")
- `--percentage-inv` - Inverse percentage (e.g., "50%")

**Data Attributes:**
- `[data-dragging]` - Present while dragging

**Spread Attributes:**
- `slider.root` - Track element (captures pointer)
- `slider.thumb` - Draggable thumb

---

### Tabs

Tabbed content organization.

```svelte
<script lang="ts">
  import { Tabs } from "melt/builders";

  const tabs = new Tabs({ value: "tab1" });
  const tabIds = ["tab1", "tab2", "tab3"];
</script>

<div {...tabs.triggerList}>
  {#each tabIds as id}
    <button {...tabs.getTrigger(id)}>{id}</button>
  {/each}
</div>

{#each tabIds as id}
  <div {...tabs.getContent(id)}>
    Content for {id}
  </div>
{/each}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `MaybeGetter<string>` | **required** | Active tab ID |
| `orientation` | `MaybeGetter<"horizontal" \| "vertical">` | `"horizontal"` | Orientation |
| `loop` | `MaybeGetter<boolean>` | `true` | Loop keyboard navigation |
| `selectWhenFocused` | `MaybeGetter<boolean>` | `true` | Select tab on focus |
| `onValueChange` | `(value: string) => void` | - | Called when tab changes |

**Properties:**
- `value` - Currently active tab

**Methods:**
- `getTrigger(id)` - Get trigger button attributes
- `getContent(id)` - Get content panel attributes

**Spread Attributes:**
- `tabs.triggerList` - Container for tab buttons
- `tabs.getTrigger(id)` - Individual tab button
- `tabs.getContent(id)` - Tab content panel

---

### Toaster

Toast notifications with auto-close.

```svelte
<!-- Toaster.svelte -->
<script lang="ts" module>
  import { Toaster } from "melt/builders";

  type ToastData = { title: string; description: string };
  const toaster = new Toaster<ToastData>();

  export const addToast = toaster.addToast;
</script>

<script lang="ts">
</script>

<div {...toaster.root}>
  {#each toaster.toasts as toast (toast.id)}
    <div {...toast.content}>
      <h3 {...toast.title}>{toast.data.title}</h3>
      <p {...toast.description}>{toast.data.description}</p>
      <button {...toast.close}>×</button>
    </div>
  {/each}
</div>
```

```svelte
<!-- Usage anywhere -->
<script>
  import { addToast } from "./Toaster.svelte";

  function notify() {
    addToast({
      data: { title: "Success", description: "Item saved!" },
    });
  }
</script>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `closeDelay` | `MaybeGetter<number>` | `5000` | Auto-close delay (ms), 0 to disable |
| `type` | `MaybeGetter<"polite" \| "assertive">` | `"polite"` | ARIA live region type |
| `hover` | `MaybeGetter<"pause" \| "pause-all" \| null>` | `"pause"` | Pause behavior on hover |
| `tabHidden` | `MaybeGetter<"pause-all" \| null>` | `"pause-all"` | Pause when tab hidden |

**Properties:**
- `toasts` - Array of active toasts

**Methods:**
- `addToast({ data, ...options })` - Add a toast, returns Toast instance
- `removeToast(id)` - Remove toast by ID
- `updateToast({ id, data })` - Update toast data
- `pauseAll()` / `resumeAll()` - Pause/resume all countdowns

**Toast Properties:**
- `toast.content` - Toast container
- `toast.title` - Title element
- `toast.description` - Description element
- `toast.close` - Close button

---

### Toggle

On/off toggle button.

```svelte
<script lang="ts">
  import { Toggle } from "melt/builders";

  const toggle = new Toggle();
</script>

<button {...toggle.trigger} aria-label="Toggle feature">
  {toggle.value ? "On" : "Off"}
</button>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `MaybeGetter<boolean>` | `false` | Toggle state |
| `disabled` | `MaybeGetter<boolean>` | `false` | Disable interaction |
| `onValueChange` | `(value: boolean) => void` | - | Called when value changes |

**Properties:**
- `value` - Current boolean state (readable/writable)

**Data Attributes:**
- `[data-checked]` - Present when value is true

**Spread Attributes:**
- `toggle.trigger` - Button element
- `toggle.hiddenInput` - Hidden input for forms

---

### Tooltip

Hover/focus-triggered popup.

```svelte
<script lang="ts">
  import { Tooltip } from "melt/builders";

  const tooltip = new Tooltip();
</script>

<button {...tooltip.trigger}>Hover me</button>
<div {...tooltip.content}>
  <div {...tooltip.arrow}></div>
  Tooltip content
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `MaybeGetter<boolean>` | `false` | Whether visible |
| `openDelay` | `MaybeGetter<number>` | `1000` | Delay before opening (ms) |
| `closeDelay` | `MaybeGetter<number>` | `0` | Delay before closing (ms) |
| `closeOnPointerDown` | `MaybeGetter<boolean>` | `true` | Close on trigger click |
| `disableHoverableContent` | `MaybeGetter<boolean>` | `false` | Close when leaving trigger |
| `forceVisible` | `MaybeGetter<boolean>` | `false` | Keep visible (for animations) |
| `floatingConfig` | `UseFloatingConfig` | - | Floating UI config |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open changes |

**Properties:**
- `open` - Current visibility state
- `isVisible` - Whether content is visible

**Spread Attributes:**
- `tooltip.trigger` - Element that triggers tooltip
- `tooltip.content` - Tooltip content
- `tooltip.arrow` - Optional arrow element

---

### Tree

Hierarchical tree view with expand/collapse.

```svelte
<script lang="ts">
  import { Tree, type TreeItem } from "melt/builders";

  const items: TreeItem[] = [
    {
      id: "1",
      value: "Folder 1",
      children: [
        { id: "1-1", value: "File 1.1" },
        { id: "1-2", value: "File 1.2" },
      ],
    },
    { id: "2", value: "File 2" },
  ];

  const tree = new Tree({ items });
</script>

{#snippet treeItems(children, depth = 0)}
  {#each children as child}
    <div {...child.attrs} style="padding-left: {depth * 16}px">
      {#if child.children?.length}
        <button onclick={() => tree.toggleExpand(child.id)}>
          {tree.isExpanded(child.id) ? "▼" : "▶"}
        </button>
      {/if}
      {child.item.value}
      {#if child.children?.length && tree.isExpanded(child.id)}
        {@render treeItems(child.children, depth + 1)}
      {/if}
    </div>
  {/each}
{/snippet}

<div {...tree.root}>
  {@render treeItems(tree.children)}
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `IterableProp<TreeItem>` | **required** | Tree items |
| `multiple` | `MaybeGetter<boolean>` | `false` | Allow multiple selection |
| `selected` | `MaybeMultiple<string, Multiple>` | - | Selected item ID(s) |
| `expanded` | `IterableProp<string>` | - | Expanded item IDs |
| `expandOnClick` | `MaybeGetter<boolean>` | `true` | Expand groups on click |
| `typeaheadTimeout` | `MaybeGetter<number>` | `500` | Typeahead reset delay |
| `onSelectedChange` | `(value) => void` | - | Called when selection changes |
| `onExpandedChange` | `(value: Set<string>) => void` | - | Called when expansion changes |

**Properties:**
- `children` - Array of Child instances
- `selected` - Selected item ID(s)
- `expanded` - Set of expanded IDs

**Methods:**
- `isSelected(id)` / `isExpanded(id)` - Check state
- `select(id)` / `deselect(id)` / `toggleSelect(id)` / `clearSelection()` / `selectAll()`
- `expand(id)` / `collapse(id)` / `toggleExpand(id)` / `expandAll()` / `collapseAll()`
- `getItem(id)` - Get item by ID
- `selectUntil(id)` - Range selection

**Spread Attributes:**
- `tree.root` - Root container
- `tree.group` - Group container
- `child.attrs` - Individual tree item

---

## Utility Types

```ts
// Value can be static or a getter function
type MaybeGetter<T> = T | (() => T);

// For components supporting multiple selection
type MaybeMultiple<T, Multiple extends boolean> = Multiple extends true
  ? IterableProp<T>
  : MaybeGetter<T>;

// Iterable that can be controlled
type IterableProp<T> = SvelteSet<T> | MaybeGetter<Iterable<T>>;

// Helper to convert builder props to component props
type ComponentProps<T> = { [K in keyof T]: T[K] | undefined };
```

## Utility Functions

```ts
import { mergeAttrs, getters } from "melt";

// Merge multiple attribute objects, combining event handlers
const attrs = mergeAttrs(builder.trigger, { onclick: () => {} });

// Convert component props to getters for controlled builders
const builder = new Toggle(getters(props));
```

---

## Links

- [Documentation](https://next.melt-ui.com/)
- [Installation Guide](https://next.melt-ui.com/guides/installation)
- [GitHub Repository](https://github.com/melt-ui/next-gen)
- [Floating UI](https://floating-ui.com/) - Used for positioning
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/$state) - Reactivity system
