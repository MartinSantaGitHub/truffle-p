import React, {useEffect, useState} from 'react';

const Test = () => {
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);

    useEffect(() => {
        setA(1);

        return () => {
            setA(0);
        }
    }, [b]);
};