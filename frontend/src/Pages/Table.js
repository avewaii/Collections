import React, {useEffect, useState, useContext} from 'react';
import { TableContext } from '../TableContext'

import * as ReactBootstrap from 'react-bootstrap'
import Header from '../Components/Header'
import TableNav from '../Components/TableNav'
const axios = require('axios');


function Table() {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        (async () => {
            axios.get('/api/users/register')
                .then(response => setUsers(Object.values(response.data)))
                .catch((error) => {
                    console.log(error)
                })
        })()
    }, [])

    let [ checkboxes, setCheckboxes ] = useState([]);

    return(
        <>
            <Header/>

            <TableContext.Provider value={{ checkboxes, setCheckboxes }}>
                <TableNav/>
            </TableContext.Provider>

            <ReactBootstrap.Table striped bordered hover>
                <thead>
                <tr>
                    <th>
                        <input type='checkbox'/>
                    </th>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Last LogIn</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                    {users.map((users, index) => (
                        <tr key={users.id}>
                            <th scope='row'>
                                <input
                                    onChange={(e) => {
                                        if (checkboxes.includes(users.id)) {
                                            setCheckboxes(checkboxes.filter(item => item !== users.id));
                                        } else {
                                            let newId = [users.id];
                                            setCheckboxes(checkboxes => checkboxes.concat(newId));
                                        }
                                    }}
                                    type='checkbox'/>
                            </th>
                            <td>{users.id}</td>
                            <td>{users.email}</td>
                            <td>{users.password}</td>
                            <td>{users.last_login}</td>
                            <td>{users.blocked}</td>
                        </tr>
                        )
                    )}
                </tbody>
            </ReactBootstrap.Table>
        </>
    )
}

export default Table;
