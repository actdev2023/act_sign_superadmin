import React from "react";
import { Button, IconButton } from "@mui/material";
import Icon from 'src/@core/components/icon';

interface ActionsColumnProps {
    id: number;
    onDownload: (id: number) => void;
}

const ActionsColumn: React.FC<ActionsColumnProps> = ({ id, onDownload }) => {
    return (
        <div>
            <IconButton onClick={() => onDownload(id)} >
                <Icon icon='tabler:download' />
            </IconButton>
        </div>
    );
};

export default ActionsColumn;