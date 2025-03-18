import { writable } from 'svelte/store';

// Initialize auth store from localStorage if available
const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('auth') : null;
const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;

export const authStore = writable(initialAuth);

// Subscribe to changes and update localStorage
if (typeof window !== 'undefined') {
    authStore.subscribe(value => {
        if (value) {
            localStorage.setItem('auth', JSON.stringify(value));
        }
    });
}
