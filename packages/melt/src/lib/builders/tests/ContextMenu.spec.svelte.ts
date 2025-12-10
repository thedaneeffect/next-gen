import { testWithEffect } from "$lib/utils/test.svelte";
import { expect, expectTypeOf } from "vitest";
import { ContextMenu, ContextMenuSub } from "../ContextMenu.svelte";

// ============================================================================
// ContextMenu Tests
// ============================================================================

testWithEffect("ContextMenu: default state should be closed", () => {
	const menu = new ContextMenu();
	expect(menu.open).toBe(false);
});

testWithEffect("ContextMenu: can open and close via property", () => {
	const menu = new ContextMenu();

	expect(menu.open).toBe(false);

	menu.open = true;
	expect(menu.open).toBe(true);

	menu.open = false;
	expect(menu.open).toBe(false);
});

testWithEffect("ContextMenu: respects initial open state", () => {
	const menu = new ContextMenu({ open: true });
	expect(menu.open).toBe(true);
});

testWithEffect("ContextMenu: controlled mode with getter", () => {
	let isOpen = $state(false);

	const menu = new ContextMenu({
		open: () => isOpen,
		onOpenChange: (v) => (isOpen = v),
	});

	expect(menu.open).toBe(false);

	isOpen = true;
	expect(menu.open).toBe(true);

	isOpen = false;
	expect(menu.open).toBe(false);
});

testWithEffect("ContextMenu: onOpenChange callback is called", () => {
	let callCount = 0;
	let lastValue: boolean | undefined;

	const menu = new ContextMenu({
		onOpenChange: (v) => {
			callCount++;
			lastValue = v;
		},
	});

	menu.open = true;
	expect(callCount).toBe(1);
	expect(lastValue).toBe(true);

	menu.open = false;
	expect(callCount).toBe(2);
	expect(lastValue).toBe(false);
});

testWithEffect("ContextMenu: closeOnEscape defaults to true", () => {
	const menu = new ContextMenu();
	expect(menu.closeOnEscape).toBe(true);
});

testWithEffect("ContextMenu: closeOnEscape can be disabled", () => {
	const menu = new ContextMenu({ closeOnEscape: false });
	expect(menu.closeOnEscape).toBe(false);
});

testWithEffect("ContextMenu: closeOnOutsideClick defaults to true", () => {
	const menu = new ContextMenu();
	expect(menu.closeOnOutsideClick).toBe(true);
});

testWithEffect("ContextMenu: closeOnOutsideClick can be disabled", () => {
	const menu = new ContextMenu({ closeOnOutsideClick: false });
	expect(menu.closeOnOutsideClick).toBe(false);
});

testWithEffect("ContextMenu: close() method closes the menu", () => {
	const menu = new ContextMenu();
	menu.open = true;
	expect(menu.open).toBe(true);

	menu.close();
	expect(menu.open).toBe(false);
});

testWithEffect("ContextMenu: trigger has correct attributes", () => {
	const menu = new ContextMenu();

	const trigger = menu.trigger;

	expect(trigger["aria-haspopup"]).toBe("menu");
	expect(typeof trigger.oncontextmenu).toBe("function");
});

testWithEffect("ContextMenu: content has correct attributes", () => {
	const menu = new ContextMenu();

	const content = menu.content;

	expect(content.id).toBe(menu.ids.content);
	expect(content.role).toBe("menu");
	expect(content.tabindex).toBe(-1);
	expect(content.popover).toBe("manual");
	expect(content["data-state"]).toBe("closed");
});

testWithEffect("ContextMenu: content data-state updates with state", () => {
	const menu = new ContextMenu();

	expect(menu.content["data-state"]).toBe("closed");

	menu.open = true;

	expect(menu.content["data-state"]).toBe("open");
});

testWithEffect("ContextMenu: getItem returns correct attributes", () => {
	const menu = new ContextMenu();

	const item = menu.getItem({});

	expect(item.role).toBe("menuitem");
	expect(typeof item.onclick).toBe("function");
	expect(typeof item.onpointerenter).toBe("function");
});

testWithEffect("ContextMenu: getItem disabled state", () => {
	const menu = new ContextMenu();

	const item = menu.getItem({ disabled: true });

	expect(item["data-disabled"]).toBe("");
});

testWithEffect("ContextMenu: separator has correct attributes", () => {
	const menu = new ContextMenu();

	const separator = menu.separator;

	expect(separator.role).toBe("separator");
});

testWithEffect("ContextMenu: label has correct attributes", () => {
	const menu = new ContextMenu();

	const label = menu.label;

	expect(label.role).toBe("group");
});

testWithEffect("ContextMenu: ids are unique", () => {
	const menu1 = new ContextMenu();
	const menu2 = new ContextMenu();

	expect(menu1.ids.content).not.toBe(menu2.ids.content);
});

// ============================================================================
// Submenu Tests
// ============================================================================

testWithEffect("ContextMenuSub: createSub returns a ContextMenuSub instance", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	expect(sub).toBeInstanceOf(ContextMenuSub);
});

testWithEffect("ContextMenuSub: default state should be closed", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	expect(sub.open).toBe(false);
});

testWithEffect("ContextMenuSub: can open and close via property", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	expect(sub.open).toBe(false);

	sub.open = true;
	expect(sub.open).toBe(true);

	sub.open = false;
	expect(sub.open).toBe(false);
});

testWithEffect("ContextMenuSub: controlled mode with getter", () => {
	const menu = new ContextMenu();
	let isOpen = $state(false);

	const sub = menu.createSub({
		open: () => isOpen,
		onOpenChange: (v) => (isOpen = v),
	});

	expect(sub.open).toBe(false);

	isOpen = true;
	expect(sub.open).toBe(true);
});

testWithEffect("ContextMenuSub: trigger has correct attributes", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	const trigger = sub.trigger;

	expect(trigger.role).toBe("menuitem");
	expect(trigger["aria-haspopup"]).toBe("menu");
	expect(trigger["aria-expanded"]).toBe(false);
	expect(trigger["data-state"]).toBe("closed");
});

testWithEffect("ContextMenuSub: trigger aria-expanded updates with state", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	expect(sub.trigger["aria-expanded"]).toBe(false);
	expect(sub.trigger["data-state"]).toBe("closed");

	sub.open = true;

	expect(sub.trigger["aria-expanded"]).toBe(true);
	expect(sub.trigger["data-state"]).toBe("open");
});

testWithEffect("ContextMenuSub: content has correct attributes", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	const content = sub.content;

	expect(content.id).toBe(sub.ids.content);
	expect(content.role).toBe("menu");
	expect(content.tabindex).toBe(-1);
	expect(content.popover).toBe("manual");
});

testWithEffect("ContextMenuSub: getItem returns correct attributes", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	const item = sub.getItem({});

	expect(item.role).toBe("menuitem");
});

testWithEffect("ContextMenuSub: separator has correct attributes", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	expect(sub.separator.role).toBe("separator");
});

testWithEffect("ContextMenuSub: label has correct attributes", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	expect(sub.label.role).toBe("group");
});

testWithEffect("ContextMenuSub: nested submenus work", () => {
	const menu = new ContextMenu();
	const sub1 = menu.createSub();
	const sub2 = sub1.createSub();

	expect(sub2).toBeInstanceOf(ContextMenuSub);
	expect(sub2.open).toBe(false);
});

testWithEffect("ContextMenuSub: closing parent closes children", () => {
	const menu = new ContextMenu();
	const sub1 = menu.createSub();
	const sub2 = sub1.createSub();

	menu.open = true;
	sub1.open = true;
	sub2.open = true;

	expect(menu.open).toBe(true);
	expect(sub1.open).toBe(true);
	expect(sub2.open).toBe(true);

	menu.open = false;

	expect(menu.open).toBe(false);
	expect(sub1.open).toBe(false);
	expect(sub2.open).toBe(false);
});

testWithEffect("ContextMenuSub: closing mid-level closes descendants only", () => {
	const menu = new ContextMenu();
	const sub1 = menu.createSub();
	const sub2 = sub1.createSub();

	menu.open = true;
	sub1.open = true;
	sub2.open = true;

	sub1.open = false;

	expect(menu.open).toBe(true);
	expect(sub1.open).toBe(false);
	expect(sub2.open).toBe(false);
});

// ============================================================================
// Type Tests
// ============================================================================

testWithEffect("ContextMenu: type tests", () => {
	const menu = new ContextMenu();

	// Open state
	expectTypeOf(menu.open).toEqualTypeOf<boolean>();

	// Props
	expectTypeOf(menu.closeOnEscape).toEqualTypeOf<boolean>();
	expectTypeOf(menu.closeOnOutsideClick).toEqualTypeOf<boolean>();

	// IDs
	expectTypeOf(menu.ids.content).toEqualTypeOf<string>();
});

testWithEffect("ContextMenuSub: type tests", () => {
	const menu = new ContextMenu();
	const sub = menu.createSub();

	// Open state
	expectTypeOf(sub.open).toEqualTypeOf<boolean>();

	// IDs
	expectTypeOf(sub.ids.content).toEqualTypeOf<string>();
});
