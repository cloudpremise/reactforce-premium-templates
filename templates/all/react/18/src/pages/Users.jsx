import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @mui/material/core components

import Card from '@salesforce/design-system-react/components/card';
import Input from '@salesforce/design-system-react/components/input';
import DataTable from '../components/DataTable';
import DataTableCell from '@salesforce/design-system-react/components/data-table/cell';
import DataTableColumn from '@salesforce/design-system-react/components/data-table/column';
import DataTableInteractiveLink from '@salesforce/design-system-react/components/data-table/interactive-link';
import useApexAdapter from "../hooks/useApexAdapter";
import InlineIcon from "../components/Icons/InlineIcon";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";

const CustomDataTableCell = ({ children, ...props }) => (
	<DataTableCell title={children} {...props}>
		<DataTableInteractiveLink>{children}</DataTableInteractiveLink>
	</DataTableCell>
);
CustomDataTableCell.displayName = DataTableCell.displayName;

const Users = (props) => {
    const [state, setState] = React.useState({
        page: 1,
        callApi: true,
        loading: false,
        loadingMore: false,
        response: null,
        viewMore: false,
        RF_LIMIT: 10,
        RF_OFFSET: 0,
        showLoadMore: false,
        cancelToken: null,
        RF_ORDER_BY: null,
        errorMessage: null,
        saving: false,
        sortColumn: 'opportunityName',
		sortColumnDirection: {
			opportunityName: 'asc',
		},
		items: [],
		selection: [],
        searchText: ""
    });

    const [loading, users] = useApexAdapter({
        "sObjectTypeName": "Profile"
    });

    const sessionId = getSessionId();
    const navigate = useNavigate();
    if(typeof(sessionId) === "string" && sessionId.length <= 0){
        return navigate("/home", { replace: true });
    }

    function handleChanged(event, data){
		setState({
            ...state,
            selection: data.selection
        });
		console.log(event, data);
	};

	function handleSort(sortColumn, ...rest){
		if (props.log) {
			props.log('sort')(sortColumn, ...rest);
		}

		const sortProperty = sortColumn.property;
		const { sortDirection } = sortColumn;
		const newState = {
            ...state,
			sortColumn: sortProperty,
			sortColumnDirection: {
				[sortProperty]: sortDirection,
			},
			items: [...state.items],
		};

		// needs to work in both directions
		newState.items = newState.items.sort((a, b) => {
			let val = 0;

			if (a[sortProperty] > b[sortProperty]) {
				val = 1;
			}
			if (a[sortProperty] < b[sortProperty]) {
				val = -1;
			}

			if (sortDirection === 'desc') {
				val *= -1;
			}

			return val;
		});

		setState(newState);
	};
    function handleFilterChange(event){
        setState({
            ...state,
            searchText: event.target.value,
            isFiltering: true
        });
	};
    function getItems(){
        let items = [];
        if(loading){
            for(let i = 0; i <= 15; i++){
                items.push({
                    id: "",
                    Id: "",
                    IsSsoEnabled: false,
                    Name: "",
                    UserLicenseId: "",
                    UserType: "",
                });
            }
            return items;
        }
        if(users === null){
            return items;
        }
        if(state.searchText.length > 0){
            const filteredItems = users.filter((item) =>
                RegExp(state.searchText, 'i').test(item.Name)
            );
            filteredItems.map((user) => {
                items.push({
                    ...user,
                    id: user.Id,
                    IsSsoEnabled: (user.IsSsoEnabled ? "Yes" : "No")
                });
                return null;
            });
        }else{
            users.map((user) => {
                items.push({
                    ...user,
                    id: user.Id,
                    IsSsoEnabled: (user.IsSsoEnabled ? "Yes" : "No")
                });
                return null;
            });
        }
        return items;
        
    }
    const items = getItems();
    const isEmpty = items.length === 0;
    return (
        <div className="slds-grid slds-grid_vertical">
            <Card
                id="ExampleCard"
                filter={
                    (!isEmpty || state.isFiltering) && (
                        <Input
                            assistiveText={{ label: "Find in List" }}
                            iconLeft={<InlineIcon size="xx-small" category="utility" justIcon name="search" className="slds-input__icon_left slds-input__icon" />}
                            onChange={handleFilterChange}
                            placeholder="Find in List"
                        />
                    )
                }
                heading="Users sObject API Demo (MP)"
                icon={<InlineIcon category="standard" name="customers" />}
            >
                <DataTable
                    id="users-table"
                    assistiveText={{
                        actionsHeader: 'actions',
                        columnSort: 'sort this column',
                        columnSortedAscending: 'asc',
                        columnSortedDescending: 'desc',
                        selectAllRows: 'Select all rows',
                        selectRow: 'Select this row',
                    }}
                    fixedLayout={true}
                    resizable={false}
                    keyboardNavigation
                    items={items}
                    onRowChange={handleChanged}
                    onSort={handleSort}
                    selection={state.selection}
                    selectRows="checkbox"
                    className={loading ? "table_stencils" : ""}
                >
                    <DataTableColumn
                        isSorted={state.sortColumn === 'Id'}
                        label="Id"
                        primaryColumn
                        property="Id"
                        sortable
                        sortDirection={state.sortColumnDirection.Id}
                        width="10rem"
                    >
                        <CustomDataTableCell />
                    </DataTableColumn>
                    <DataTableColumn
                        label="Account Name"
                        property="Name"
                        width="8rem"
                    />
                    <DataTableColumn
                        label="Account Type"
                        property="UserType"
                        width="8rem"
                    />
                    <DataTableColumn
                        label="License"
                        property="UserLicenseId"
                        width="8rem"
                    />
                    <DataTableColumn
                        label="Sso Enabled"
                        property="IsSsoEnabled"
                        width="8rem"
                    />
                </DataTable>
            </Card>
        </div>
    )
};

Users.propTypes = {
    classes: PropTypes.object,
};

export default Users;
