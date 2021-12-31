import React from 'react';
import { Menu, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default() => {
    return (
        <Menu stackable style={{marginTop: '50px'}}>
            <Button color='blue' as={Link} to='/'>
                ERC-20 Tokens Management
            </Button>

            <Button color='green' as={Link} to='/lotery'>
                Tickets Management 
            </Button>

            <Button color='orange' as={Link} to='/awards'>
                Lotery Awards
            </Button>

            <Button color='linkedin' href='https://www.linkedin.com/in/martin-santamaria/'>
                <Icon name='linkedin' /> LinkedIn
            </Button>

            <Button color='facebook' href='https://www.facebook.com/martine5/'>
                <Icon name='linkedin' /> Facebook
            </Button>
        </Menu>
    );
}