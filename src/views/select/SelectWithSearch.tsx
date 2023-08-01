import React, { useState } from 'react';
import Select from 'react-select';

interface Option {
    value: number;
    label: string;
}

interface SelectWithSearchProps {
    options: Option[];
    onSelectChange: (selectedOption: Option | null) => void;
}

const SelectWithSearch: React.FC<SelectWithSearchProps> = ({ options, onSelectChange }) => {
    // const [selectedOption, setSelectedOption] = useState<Option | null>(null);

    const handleSelectChange = (selectedOption: Option | null) => {
        onSelectChange(selectedOption);
    };

    return (
        <Select
            options={options}
            onChange={handleSelectChange}
            isSearchable
            placeholder="Search user..."
        />
    );
};

export default SelectWithSearch;