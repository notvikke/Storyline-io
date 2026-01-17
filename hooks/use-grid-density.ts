import { useState, useEffect } from 'react';

type Density = 5 | 7;

export function useGridDensity() {
    const [density, setDensity] = useState<Density>(5);

    useEffect(() => {
        const stored = localStorage.getItem('storyline-grid-density');
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (parsed === 5 || parsed === 7) {
                setDensity(parsed as Density);
            }
        }
    }, []);

    const updateDensity = (newDensity: Density) => {
        setDensity(newDensity);
        localStorage.setItem('storyline-grid-density', String(newDensity));
    };

    return { density, setDensity: updateDensity };
}
