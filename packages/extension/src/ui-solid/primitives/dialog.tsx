/** @jsxImportSource solid-js */
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import { X } from "lucide-solid";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";

export const Dialog = DialogPrimitive;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.CloseButton;

export interface DialogOverlayProps extends ComponentProps<typeof DialogPrimitive.Overlay> {}

export const DialogOverlay = (props: DialogOverlayProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <DialogPrimitive.Overlay
      class={cn(
        "fixed inset-0 z-50 bg-black/80 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
        local.class
      )}
      {...others}
    />
  );
};

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  overlayClass?: string;
}

export const DialogContent = (props: DialogContentProps) => {
  const [local, others] = splitProps(props, ["class", "children", "overlayClass"]);
  
  return (
    <DialogPortal>
      <DialogOverlay class={local.overlayClass} />
      <DialogPrimitive.Content
        class={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] sm:rounded-lg",
          local.class
        )}
        {...others}
      >
        {local.children}
        <DialogPrimitive.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground">
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </DialogPrimitive.CloseButton>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

export interface DialogHeaderProps extends ComponentProps<"div"> {}

export const DialogHeader = (props: DialogHeaderProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        local.class
      )}
      {...others}
    />
  );
};

export interface DialogFooterProps extends ComponentProps<"div"> {}

export const DialogFooter = (props: DialogFooterProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        local.class
      )}
      {...others}
    />
  );
};

export interface DialogTitleProps extends ComponentProps<typeof DialogPrimitive.Title> {}

export const DialogTitle = (props: DialogTitleProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <DialogPrimitive.Title
      class={cn(
        "text-lg font-semibold leading-none tracking-tight",
        local.class
      )}
      {...others}
    />
  );
};

export interface DialogDescriptionProps extends ComponentProps<typeof DialogPrimitive.Description> {}

export const DialogDescription = (props: DialogDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <DialogPrimitive.Description
      class={cn("text-sm text-muted-foreground", local.class)}
      {...others}
    />
  );
};
