import { testWithEffect } from "$lib/utils/test.svelte";
import { expect, expectTypeOf } from "vitest";
import { Dialog } from "../Dialog.svelte";
import { AlertDialog } from "../AlertDialog.svelte";

// ============================================================================
// Dialog Tests
// ============================================================================

testWithEffect("Dialog: default state should be closed", () => {
	const dialog = new Dialog();
	expect(dialog.open).toBe(false);
});

testWithEffect("Dialog: can open and close via property", () => {
	const dialog = new Dialog();

	expect(dialog.open).toBe(false);

	dialog.open = true;
	expect(dialog.open).toBe(true);

	dialog.open = false;
	expect(dialog.open).toBe(false);
});

testWithEffect("Dialog: respects initial open state", () => {
	const dialog = new Dialog({ open: true });
	expect(dialog.open).toBe(true);
});

testWithEffect("Dialog: controlled mode with getter", () => {
	let isOpen = $state(false);

	const dialog = new Dialog({
		open: () => isOpen,
		onOpenChange: (v) => (isOpen = v),
	});

	expect(dialog.open).toBe(false);

	isOpen = true;
	expect(dialog.open).toBe(true);

	isOpen = false;
	expect(dialog.open).toBe(false);
});

testWithEffect("Dialog: onOpenChange callback is called", () => {
	let callCount = 0;
	let lastValue: boolean | undefined;

	const dialog = new Dialog({
		onOpenChange: (v) => {
			callCount++;
			lastValue = v;
		},
	});

	dialog.open = true;
	expect(callCount).toBe(1);
	expect(lastValue).toBe(true);

	dialog.open = false;
	expect(callCount).toBe(2);
	expect(lastValue).toBe(false);
});

testWithEffect("Dialog: closeOnEscape defaults to true", () => {
	const dialog = new Dialog();
	expect(dialog.closeOnEscape).toBe(true);
});

testWithEffect("Dialog: closeOnEscape can be disabled", () => {
	const dialog = new Dialog({ closeOnEscape: false });
	expect(dialog.closeOnEscape).toBe(false);
});

testWithEffect("Dialog: closeOnOutsideClick defaults to true", () => {
	const dialog = new Dialog();
	expect(dialog.closeOnOutsideClick).toBe(true);
});

testWithEffect("Dialog: closeOnOutsideClick can be disabled", () => {
	const dialog = new Dialog({ closeOnOutsideClick: false });
	expect(dialog.closeOnOutsideClick).toBe(false);
});

testWithEffect("Dialog: scrollBehavior defaults to 'prevent'", () => {
	const dialog = new Dialog();
	expect(dialog.scrollBehavior).toBe("prevent");
});

testWithEffect("Dialog: scrollBehavior can be set to 'allow'", () => {
	const dialog = new Dialog({ scrollBehavior: "allow" });
	expect(dialog.scrollBehavior).toBe("allow");
});

testWithEffect("Dialog: forceVisible defaults to false", () => {
	const dialog = new Dialog();
	expect(dialog.forceVisible).toBe(false);
});

testWithEffect("Dialog: forceVisible can be enabled", () => {
	const dialog = new Dialog({ forceVisible: true });
	expect(dialog.forceVisible).toBe(true);
});

testWithEffect("Dialog: trigger has correct attributes", () => {
	const dialog = new Dialog();

	const trigger = dialog.trigger;

	expect(trigger["aria-haspopup"]).toBe("dialog");
	expect(trigger["aria-expanded"]).toBe(false);
	expect(trigger["data-state"]).toBe("closed");
	expect(trigger["aria-controls"]).toBe(dialog.ids.content);
	expect(typeof trigger.onclick).toBe("function");
});

testWithEffect("Dialog: trigger aria-expanded updates with state", () => {
	const dialog = new Dialog();

	expect(dialog.trigger["aria-expanded"]).toBe(false);
	expect(dialog.trigger["data-state"]).toBe("closed");

	dialog.open = true;

	expect(dialog.trigger["aria-expanded"]).toBe(true);
	expect(dialog.trigger["data-state"]).toBe("open");
});

testWithEffect("Dialog: content has correct attributes", () => {
	const dialog = new Dialog();

	const content = dialog.content;

	expect(content.id).toBe(dialog.ids.content);
	expect(content.role).toBe("dialog");
	expect(content["aria-modal"]).toBe(true);
	expect(content["aria-labelledby"]).toBe(dialog.ids.title);
	expect(content["aria-describedby"]).toBe(dialog.ids.description);
	expect(content["data-state"]).toBe("closed");
});

testWithEffect("Dialog: content data-state updates with state", () => {
	const dialog = new Dialog();

	expect(dialog.content["data-state"]).toBe("closed");

	dialog.open = true;

	expect(dialog.content["data-state"]).toBe("open");
});

testWithEffect("Dialog: close button has correct attributes", () => {
	const dialog = new Dialog();

	const close = dialog.close;

	expect(close["data-state"]).toBe("closed");
	expect(typeof close.onclick).toBe("function");
});

testWithEffect("Dialog: title has correct attributes", () => {
	const dialog = new Dialog();

	const title = dialog.title;

	expect(title.id).toBe(dialog.ids.title);
});

testWithEffect("Dialog: description has correct attributes", () => {
	const dialog = new Dialog();

	const description = dialog.description;

	expect(description.id).toBe(dialog.ids.description);
});

testWithEffect("Dialog: ids are unique", () => {
	const dialog1 = new Dialog();
	const dialog2 = new Dialog();

	expect(dialog1.ids.content).not.toBe(dialog2.ids.content);
	expect(dialog1.ids.title).not.toBe(dialog2.ids.title);
	expect(dialog1.ids.description).not.toBe(dialog2.ids.description);
});

// ============================================================================
// AlertDialog Tests
// ============================================================================

testWithEffect("AlertDialog: default state should be closed", () => {
	const alertDialog = new AlertDialog();
	expect(alertDialog.open).toBe(false);
});

testWithEffect("AlertDialog: can open and close via property", () => {
	const alertDialog = new AlertDialog();

	expect(alertDialog.open).toBe(false);

	alertDialog.open = true;
	expect(alertDialog.open).toBe(true);

	alertDialog.open = false;
	expect(alertDialog.open).toBe(false);
});

testWithEffect("AlertDialog: scrollBehavior defaults to 'prevent'", () => {
	const alertDialog = new AlertDialog();
	expect(alertDialog.scrollBehavior).toBe("prevent");
});

testWithEffect("AlertDialog: trigger has correct attributes", () => {
	const alertDialog = new AlertDialog();

	const trigger = alertDialog.trigger;

	expect(trigger["aria-haspopup"]).toBe("dialog");
	expect(trigger["aria-expanded"]).toBe(false);
	expect(trigger["data-state"]).toBe("closed");
});

testWithEffect("AlertDialog: content has role alertdialog", () => {
	const alertDialog = new AlertDialog();

	const content = alertDialog.content;

	expect(content.role).toBe("alertdialog");
	expect(content["aria-modal"]).toBe(true);
});

testWithEffect("AlertDialog: cancel button has correct attributes", () => {
	const alertDialog = new AlertDialog();

	const cancel = alertDialog.cancel;

	expect(cancel["data-state"]).toBe("closed");
	expect(typeof cancel.onclick).toBe("function");
});

testWithEffect("AlertDialog: action button has correct attributes", () => {
	const alertDialog = new AlertDialog();

	const action = alertDialog.action;

	expect(action["data-state"]).toBe("closed");
	expect(typeof action.onclick).toBe("function");
});

testWithEffect("AlertDialog: title has correct attributes", () => {
	const alertDialog = new AlertDialog();

	const title = alertDialog.title;

	expect(title.id).toBe(alertDialog.ids.title);
});

testWithEffect("AlertDialog: description has correct attributes", () => {
	const alertDialog = new AlertDialog();

	const description = alertDialog.description;

	expect(description.id).toBe(alertDialog.ids.description);
});

// ============================================================================
// Type Tests
// ============================================================================

testWithEffect("Dialog: type tests", () => {
	const dialog = new Dialog();

	// Open state
	expectTypeOf(dialog.open).toEqualTypeOf<boolean>();

	// Props
	expectTypeOf(dialog.closeOnEscape).toEqualTypeOf<boolean>();
	expectTypeOf(dialog.closeOnOutsideClick).toEqualTypeOf<boolean>();
	expectTypeOf(dialog.scrollBehavior).toEqualTypeOf<"prevent" | "allow">();
	expectTypeOf(dialog.forceVisible).toEqualTypeOf<boolean>();

	// IDs
	expectTypeOf(dialog.ids.content).toEqualTypeOf<string>();
	expectTypeOf(dialog.ids.title).toEqualTypeOf<string>();
	expectTypeOf(dialog.ids.description).toEqualTypeOf<string>();
});

testWithEffect("AlertDialog: type tests", () => {
	const alertDialog = new AlertDialog();

	// Open state
	expectTypeOf(alertDialog.open).toEqualTypeOf<boolean>();

	// Props
	expectTypeOf(alertDialog.scrollBehavior).toEqualTypeOf<"prevent" | "allow">();
	expectTypeOf(alertDialog.forceVisible).toEqualTypeOf<boolean>();

	// IDs
	expectTypeOf(alertDialog.ids.content).toEqualTypeOf<string>();
	expectTypeOf(alertDialog.ids.title).toEqualTypeOf<string>();
	expectTypeOf(alertDialog.ids.description).toEqualTypeOf<string>();
});
