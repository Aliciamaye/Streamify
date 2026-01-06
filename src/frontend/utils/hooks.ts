/**
 * Performance and utility hooks for the frontend
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * Debounce hook - delays execution until after wait time has passed since last call
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Throttle hook - limits execution to once per specified time period
 * @param callback - Function to throttle
 * @param delay - Minimum time between executions in milliseconds
 */
export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 500
): (...args: Parameters<T>) => void {
    const lastRun = useRef(Date.now());
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            const timeSinceLastRun = now - lastRun.current;

            if (timeSinceLastRun >= delay) {
                callback(...args);
                lastRun.current = now;
            } else {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    callback(...args);
                    lastRun.current = Date.now();
                }, delay - timeSinceLastRun);
            }
        },
        [callback, delay]
    );
}

/**
 * Local storage hook with type safety
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that persists to localStorage
    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            try {
                // Allow value to be a function so we have same API as useState
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}

/**
 * Previous value hook - returns the previous value of a prop or state
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * Intersection observer hook for lazy loading
 * @param options - IntersectionObserver options
 */
export function useIntersectionObserver(
    options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            { threshold: 0.1, ...options }
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [options]);

    return [targetRef, isIntersecting];
}

/**
 * Media query hook - responsive design helper
 * @param query - Media query string
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
        // Legacy browsers
        else {
            mediaQuery.addListener(handler);
            return () => mediaQuery.removeListener(handler);
        }
    }, [query]);

    return matches;
}

/**
 * Async hook - manages async operation state
 * @param asyncFunction - Async function to execute
 */
export function useAsync<T, E = Error>(
    asyncFunction: () => Promise<T>,
    immediate = true
) {
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<E | null>(null);

    const execute = useCallback(async () => {
        setStatus('pending');
        setData(null);
        setError(null);

        try {
            const response = await asyncFunction();
            setData(response);
            setStatus('success');
            return response;
        } catch (err) {
            setError(err as E);
            setStatus('error');
            throw err;
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { execute, status, data, error };
}

/**
 * Click outside hook - detects clicks outside an element
 * @param callback - Function to call when clicking outside
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    callback: () => void
): React.RefObject<T> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [callback]);

    return ref;
}

/**
 * Keyboard shortcut hook
 * @param keys - Key combination (e.g., 'ctrl+k', 'meta+s')
 * @param callback - Function to call when keys are pressed
 */
export function useKeyboardShortcut(
    keys: string,
    callback: (event: KeyboardEvent) => void,
    options: { enabled?: boolean } = {}
) {
    const { enabled = true } = options;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const keyParts = keys.toLowerCase().split('+');
            const key = keyParts[keyParts.length - 1];
            const modifiers = keyParts.slice(0, -1);

            let matches = event.key.toLowerCase() === key;

            if (modifiers.includes('ctrl') && !event.ctrlKey) matches = false;
            if (modifiers.includes('shift') && !event.shiftKey) matches = false;
            if (modifiers.includes('alt') && !event.altKey) matches = false;
            if (modifiers.includes('meta') && !event.metaKey) matches = false;

            if (matches) {
                event.preventDefault();
                callback(event);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [keys, callback, enabled]);
}

/**
 * Window size hook - tracks window dimensions
 */
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

/**
 * Memoized array hook - returns a stable array reference
 */
export function useMemoizedArray<T>(array: T[], compareFn?: (a: T[], b: T[]) => boolean): T[] {
    const previousArray = useRef<T[]>(array);

    return useMemo(() => {
        const compare = compareFn || ((a: T[], b: T[]) => {
            if (a.length !== b.length) return false;
            return a.every((item, index) => item === b[index]);
        });

        if (compare(array, previousArray.current)) {
            return previousArray.current;
        }

        previousArray.current = array;
        return array;
    }, [array, compareFn]);
}
