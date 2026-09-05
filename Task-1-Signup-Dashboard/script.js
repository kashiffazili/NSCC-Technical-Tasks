/* ==========================================================================
   NSCC Signup & User Dashboard — script.js
   Plain (vanilla) JavaScript, no libraries.

   How the app flows:
     page load  -> getUsers() from localStorage -> renderUsers()
     signup     -> validate -> hash password -> save to localStorage -> re-render
     delete     -> confirm in modal -> remove one user -> save -> re-render
   ========================================================================== */

"use strict";

/* ------------------------------------------------------------------
   1. Constants and element references
------------------------------------------------------------------ */

// Key under which the users array lives in localStorage.
const STORAGE_KEY = "nscc_users";

// Requires "something@something.domain" with no spaces.
// ^ and $ anchor the whole string, [^\s@]+ means "1+ chars that are not a
// space or @", \. is a literal dot, and {2,} demands a 2+ letter TLD.
const EMAIL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.(?:com|org|net|edu|gov|mil|int|in|co\.in|org\.in|net\.in|ac\.in|gov\.in|io|ai|dev|app|me|co|uk|us|ca|au|de|fr|jp|cn|sg|ae|pk|bd)$/i;

const form = document.getElementById("signup-form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupButton = document.getElementById("signup-button");
const togglePasswordButton = document.getElementById("toggle-password");
const usersTableBody = document.getElementById("users-tbody");
const tableWrap = document.getElementById("table-wrap");
const emptyState = document.getElementById("empty-state");
const userCount = document.getElementById("user-count");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const confirmModal = document.getElementById("confirm-modal");
const confirmText = document.getElementById("confirm-text");
const confirmDeleteButton = document.getElementById("confirm-delete");
const cancelDeleteButton = document.getElementById("cancel-delete");

// Remembers which user the confirmation modal is currently asking about.
let pendingDeleteUser = null;

// Used to hide the toast a few seconds after it appears.
let toastTimer = null;

/* ------------------------------------------------------------------
   2. localStorage helpers
------------------------------------------------------------------ */

/**
 * Read the users array from localStorage.
 * localStorage only stores strings, so we JSON.parse() the value.
 * Returns an empty array when nothing is stored yet (or data is corrupted).
 */
function getUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const users = JSON.parse(stored);
    if (!Array.isArray(users)) return [];

    // Ignore malformed records so one bad localStorage value cannot break
    // the whole dashboard.
    return users.filter(
      (user) =>
        user &&
        typeof user.id === "string" &&
        typeof user.username === "string" &&
        typeof user.email === "string" &&
        typeof user.passwordHash === "string"
    );
  } catch (error) {
    console.error("Could not read users from localStorage:", error);
    return [];
  }
}

/**
 * Save the users array back to localStorage.
 * JSON.stringify() converts the array of objects into a string.
 */
function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Could not save users to localStorage:", error);
    showToast("Could not save the user. Browser storage may be unavailable.", "error");
    return false;
  }
}

/* ------------------------------------------------------------------
   3. Validation
   Each validator returns an error message, or "" when the field is valid.
------------------------------------------------------------------ */

function validateUsername(username) {
  if (!username.trim()) {
    return "Username is required.";
  }
  return "";
}

function validateEmail(email) {
  const value = email.trim();
  if (!value) {
    return "Email is required.";
  }
  if (!EMAIL_REGEX.test(value)) {
    return "Please enter a valid email address, e.g. name@example.com.";
  }
  return "";
}

function validatePassword(password) {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return "";
}

/**
 * Show (or clear, when message is "") the error for the field an input
 * belongs to, and mark it with the .invalid CSS class.
 */
function showFieldError(input, message) {
  const field = input.closest(".field");
  const errorSlot = field.querySelector(".error-message");
  errorSlot.textContent = message;
  field.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function clearAllErrors() {
  [usernameInput, emailInput, passwordInput].forEach((input) =>
    showFieldError(input, "")
  );
}

/* ------------------------------------------------------------------
   4. Password hashing with the Web Crypto API
------------------------------------------------------------------ */

/**
 * Hash a password with SHA-256 and return the hash as a hex string.
 *
 * crypto.subtle.digest() is asynchronous (it returns a Promise), so this
 * function is `async` and callers must `await` it. Only the resulting
 * hash is ever stored — the original password is thrown away.
 */
async function hashPassword(password) {
  // TextEncoder turns the string into raw bytes, which digest() needs.
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert each byte of the hash into two hexadecimal characters,
  // e.g. byte 255 -> "ff". padStart keeps single digits as "0f" etc.
  const bytes = Array.from(new Uint8Array(hashBuffer));
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------------------------------------------
   5. Rendering the dashboard
------------------------------------------------------------------ */

/**
 * Rebuild the whole user table from localStorage.
 * Called on page load, after every signup and after every delete,
 * so the UI always matches what is stored.
 */
function renderUsers() {
  const users = getUsers();

  usersTableBody.innerHTML = "";
  users.forEach((user) => usersTableBody.appendChild(createTableRow(user)));

  // Swap between the table and the "no users" empty state.
  const hasUsers = users.length > 0;
  tableWrap.classList.toggle("hidden", !hasUsers);
  emptyState.classList.toggle("hidden", hasUsers);
  userCount.textContent = users.length;
}

/** Build one <tr> element for a user object. */
function createTableRow(user) {
  const row = document.createElement("tr");

  // data-label powers the mobile card layout (shown via CSS ::before).
  const usernameCell = document.createElement("td");
  usernameCell.dataset.label = "Username";
  const usernameText = document.createElement("span");
  usernameText.className = "cell-main";
  // textContent (not innerHTML) — user input can never inject HTML/JS.
  usernameText.textContent = user.username;
  usernameCell.appendChild(usernameText);

  const emailCell = document.createElement("td");
  emailCell.dataset.label = "Email";
  const emailText = document.createElement("span");
  emailText.className = "cell-email";
  emailText.textContent = user.email;
  emailCell.appendChild(emailText);

  const passwordCell = document.createElement("td");
  passwordCell.dataset.label = "Password";
  const hashCode = document.createElement("code");
  hashCode.className = "hash";
  // Show the complete SHA-256 hash because the task asks for the stored
  // password value. CSS handles wrapping/scrolling on smaller screens.
  hashCode.textContent = user.passwordHash;
  hashCode.title = "Click to copy the full hash";
  hashCode.dataset.fullHash = user.passwordHash;
  passwordCell.appendChild(hashCode);

  const actionCell = document.createElement("td");
  actionCell.dataset.label = "Action";
  actionCell.className = "actions";
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  // Storing the user's unique id on the button lets one delegated click
  // listener know exactly which user to delete.
  deleteButton.dataset.id = user.id;
  deleteButton.setAttribute("aria-label", "Delete " + user.username);
  deleteButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>' +
    "Delete";
  actionCell.appendChild(deleteButton);

  row.append(usernameCell, emailCell, passwordCell, actionCell);
  return row;
}

/* ------------------------------------------------------------------
   6. Toast notifications
------------------------------------------------------------------ */

/** Show a short message at the bottom of the screen. type: "success" | "error" */
function showToast(message, type) {
  toastMessage.textContent = message;
  toast.className = "toast show " + (type || "success");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* ------------------------------------------------------------------
   7. Signup flow
------------------------------------------------------------------ */

/** Create a unique id for each user so deletes are reliable. */
function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for very old browsers.
  return "user-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
}

/** Give the button a spinner while the (async) hashing runs. */
function setLoading(isLoading) {
  signupButton.disabled = isLoading;
  signupButton.classList.toggle("loading", isLoading);
}

/**
 * Handle the form submit event:
 * prevent reload -> validate -> hash -> store -> re-render dashboard.
 * It is async because hashPassword() is async.
 */
async function handleSignup(event) {
  // 1. Stop the browser's default behaviour (page reload).
  event.preventDefault();
  clearAllErrors();

  // 2. Read the current input values.
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value; // never trimmed — spaces may be intentional

  // 3. Run each field through its validator and collect the messages.
  const errors = {
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  // Prevent duplicate usernames as well as duplicate email addresses.
  // Comparison is case-insensitive, so "Kashif" and "kashif" count as
  // the same username. This keeps account names unique and predictable.
  const usersBeforeSignup = getUsers();
  const usernameAlreadyUsed = usersBeforeSignup.some(
    (user) => user.username.trim().toLowerCase() === username.toLowerCase()
  );
  if (!errors.username && usernameAlreadyUsed) {
    errors.username = "This username is already registered.";
  }

  const emailAlreadyUsed = usersBeforeSignup.some(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
  if (!errors.email && emailAlreadyUsed) {
    errors.email = "This email is already registered.";
  }

  // 4. Show every error message next to its field.
  showFieldError(usernameInput, errors.username);
  showFieldError(emailInput, errors.email);
  showFieldError(passwordInput, errors.password);

  // If anything failed, focus the first invalid field and stop.
  if (errors.username || errors.email || errors.password) {
    const firstInvalid = form.querySelector(".field.invalid input");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // crypto.subtle only exists in secure contexts (https, localhost, file://).
  if (!crypto.subtle) {
    showToast(
      "Password hashing needs a secure context. Open via https or localhost.",
      "error"
    );
    return;
  }

  // 5. Hash the password and store the new user.
  setLoading(true);
  try {
    const passwordHash = await hashPassword(password);

    const users = getUsers();
    users.push({
      id: createId(),
      username,
      email: email.toLowerCase(),
      passwordHash, // only the hash is saved — never the password
    });

    if (!saveUsers(users)) return;

    renderUsers();   // dashboard updates instantly, no refresh needed
    form.reset();    // clear the form after a successful signup
    showToast("Welcome, " + username + "! Your account was created.", "success");
  } catch (error) {
    console.error("Signup failed:", error);
    showToast("Something went wrong while signing up.", "error");
  } finally {
    setLoading(false);
  }
}

/** Flip the password field between hidden and visible. */
function togglePasswordVisibility() {
  const willShow = passwordInput.type === "password";
  passwordInput.type = willShow ? "text" : "password";
  togglePasswordButton.setAttribute(
    "aria-label",
    willShow ? "Hide password" : "Show password"
  );
  document.getElementById("eye-open").classList.toggle("hidden", willShow);
  document.getElementById("eye-closed").classList.toggle("hidden", !willShow);
}

/* ------------------------------------------------------------------
   8. Delete flow (with confirmation modal)
------------------------------------------------------------------ */

function openConfirmModal(user) {
  pendingDeleteUser = user;
  confirmText.textContent =
    'Remove "' + user.username + '" (' + user.email + ")? This cannot be undone.";
  confirmModal.hidden = false;
  confirmModal.classList.add("open");
  document.body.style.overflow = "hidden"; // stop background scrolling
  confirmDeleteButton.focus();
}

function closeConfirmModal() {
  pendingDeleteUser = null;
  confirmModal.classList.remove("open");
  confirmModal.hidden = true;
  document.body.style.overflow = "";
}

/**
 * Remove ONE user by their unique id, keep everyone else.
 * Returns the removed user (or undefined) so the caller can toast about it.
 */
function deleteUser(id) {
  const users = getUsers();
  const removed = users.find((user) => user.id === id);

  // filter() builds a new array with every user EXCEPT the matching id.
  const updatedUsers = users.filter((user) => user.id !== id);
  if (!saveUsers(updatedUsers)) return undefined;

  renderUsers();
  return removed;
}

/* ------------------------------------------------------------------
   9. Small helpers that react to table clicks
------------------------------------------------------------------ */

/** Copy the full SHA-256 hash when its shortened chip is clicked. */
async function copyHash(hashElement) {
  try {
    await navigator.clipboard.writeText(hashElement.dataset.fullHash);
    showToast("Full hash copied to clipboard.", "success");
  } catch (error) {
    showToast("Could not copy — your browser blocked clipboard access.", "error");
  }
}

/**
 * One click listener on the whole <tbody> (event delegation).
 * It works for every row — even rows added after page load — because
 * we inspect what was actually clicked via event.target.closest().
 */
function handleTableClick(event) {
  const deleteButton = event.target.closest(".delete-button");
  if (deleteButton) {
    const user = getUsers().find((item) => item.id === deleteButton.dataset.id);
    if (user) openConfirmModal(user);
    return;
  }

  const hashElement = event.target.closest(".hash");
  if (hashElement) copyHash(hashElement);
}

/* ------------------------------------------------------------------
   10. Wire everything up
   The <script src="script.js"> tag sits at the end of <body>, so all
   elements above already exist when this runs.
------------------------------------------------------------------ */

form.addEventListener("submit", handleSignup);
togglePasswordButton.addEventListener("click", togglePasswordVisibility);
usersTableBody.addEventListener("click", handleTableClick);

// Clear a field's error as soon as the user starts fixing it.
[usernameInput, emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => showFieldError(input, ""));
});

// Modal buttons + behaviours.
cancelDeleteButton.addEventListener("click", closeConfirmModal);

confirmDeleteButton.addEventListener("click", () => {
  if (!pendingDeleteUser) return;
  const removed = deleteUser(pendingDeleteUser.id);
  closeConfirmModal();
  if (removed) {
    showToast('Deleted "' + removed.username + '".', "success");
  }
});

// Click on the dark overlay (outside the box) closes the modal.
confirmModal.addEventListener("click", (event) => {
  if (event.target === confirmModal) closeConfirmModal();
});

// Escape key closes the modal too.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && confirmModal.classList.contains("open")) {
    closeConfirmModal();
  }
});

// On page load, restore whatever was stored and draw the dashboard.
renderUsers();
