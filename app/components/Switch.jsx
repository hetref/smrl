"use client";

export default function Switch({ checked, onChange, disabled = false, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? "bg-black dark:bg-white"
          : "bg-zinc-200 dark:bg-zinc-800"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-zinc-950 ${
          checked
            ? "translate-x-5 bg-white dark:bg-black"
            : "translate-x-0 bg-white dark:bg-zinc-400"
        }`}
      />
    </button>
  );
}
