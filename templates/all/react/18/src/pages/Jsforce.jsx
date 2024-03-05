import React from "react";
import Api from "../Api";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @mui/material/core components

import Input from '@salesforce/design-system-react/components/input';
import DataTable from '../components/DataTable';
import DataTableCell from '@salesforce/design-system-react/components/data-table/cell';
import DataTableColumn from '@salesforce/design-system-react/components/data-table/column';
import DataTableInteractiveLink from '@salesforce/design-system-react/components/data-table/interactive-link';
import InlineIcon from "../components/Icons/InlineIcon";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";
import PageHeader from '@salesforce/design-system-react/components/page-header';
import PageHeaderControl from '@salesforce/design-system-react/components/page-header/control';
import Button from '@salesforce/design-system-react/components/button';
import ButtonGroup from '@salesforce/design-system-react/components/button-group';
import stateReducer from "../hooks/stateReducer";
import Account from "../components/Modals/JsforceAccount";
import DataTableRowActions from '../components/DataTable/RowActions';
import Dropdown from '@salesforce/design-system-react/components/menu-dropdown';
import Confirmation from "../components/Modals/Confirmation";
import { useJsforceQuery, getConnection } from "../hooks/useJsforce";

const CustomDataTableCell = ({ children, ...props }) => (
	<DataTableCell title={children} {...props}>
		<DataTableInteractiveLink>{children}</DataTableInteractiveLink>
	</DataTableCell>
);
CustomDataTableCell.displayName = DataTableCell.displayName;

const Jsforce = (props) => {
    const defaultState = {
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
        sortColumn: 'Name',
		sortColumnDirection: {
			Name: 'asc',
		},
		items: [],
		selection: [],
        searchText: "",
        accountModal: false,
        accounts: null,
        dataTableRef: React.createRef(),
        row: null
    };

    const [state, setState] = React.useReducer(stateReducer, defaultState);

    // const [loading, adapterState, setAdapterState] = useApexAdapter({
    //     "sObjectTypeName": "Account",
    //     "RF_LIMIT": state.RF_LIMIT
    // }, false, (data) => {
    //     setState({
    //         type: "update",
    //         state: {
    //             accounts: data
    //         }
    //     });
    // });
    const query = "SELECT Id, Name, Phone, CreatedDate, Website FROM Account";
    const [loading, adapterState, setAdapterState] = useJsforceQuery(query, false, (data) => {
        setState({
            type: "update",
            state: {
                accounts: data
            }
        });
    });
    const sessionId = getSessionId();
    const navigate = useNavigate();
    if(typeof(sessionId) === "string" && sessionId.length <= 0){
        return navigate("/home", { replace: true });
    }

    function handleChanged(event, data){
        setState({
            type: "update",
            state: {
                selection: data.selection
            }
        });
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

		
        setState({
            type: "update",
            state: newState
        });
	}
    function handleFilterChange(event){
        setState({
            type: "update",
            state: {
                searchText: event.target.value,
                isFiltering: true
            }
        });
	}
    function getItems(){
        let items = [];
        if(loading && state.accounts === null){
            // for(let i = 0; i <= 4; i++){
            //     items.push({
            //         key: "",
            //         id: "",
            //         Id: "",
            //         Name: "",
            //         ScheduleType__c: "",
            //         Type__c: "",
            //         BatchScope__c: 0,
            //         onClick: () => {},
            //     });
            // }
            return items;
        }
        if(state.accounts === null){
            return items;
        }
        if(state.searchText.length > 0){
            const filteredItems = state.accounts.filter((item) =>
                RegExp(state.searchText, 'i').test(item.Name)
            );
            filteredItems.map((item, key) => {
                const itemObj = {
                    ...item,
                    key: (key + 1),
                    id: item.Id,
                };
                items.push({
                    ...itemObj,
                    onClick: () => { handleRowAction(itemObj, {value: "edit"}) }
                });
                return null;
            });
        }else{
            state.accounts.map((item, key) => {
                const itemObj = {
                    ...item,
                    key: (key + 1),
                    id: item.Id,
                };
                items.push({
                    ...itemObj,
                    onClick: () => { handleRowAction(itemObj, {value: "edit"}) }
                });
                return null;
            });
        }

        // needs to work in both directions
        const { sortColumn, sortColumnDirection } = state;
        let sortDirection = "desc";
        if(sortColumnDirection.hasOwnProperty(sortColumn)){
            sortDirection = sortColumnDirection[sortColumn];
        }
		items = items.sort((a, b) => {
			let val = 0;

			if (a[sortColumn] > b[sortColumn]) {
				val = 1;
			}
			if (a[sortColumn] < b[sortColumn]) {
				val = -1;
			}

			if (sortDirection === 'desc') {
				val *= -1;
			}

			return val;
		});

        return items;
        
    }
    function handleRowAction(item, action){
        let newState = {
            [action.value+"Modal"]: true
        };
        if(item !== null){
            newState['row'] = item;
        }
        setState({
            type: "update",
            state: newState
        });      
	}
    function handleRowClick(event, item){
        setState({
            type: "update",
            state: {
                row: item
            }
        });
	}
    function handleLoadMore(){
        if(!adapterState.hasMore || state.workers === null || adapterState.callApi || adapterState.loading){
            return;
        }
        setAdapterState({
            loading: false,
            callApi: true,
            RF_OFFSET: adapterState.RF_OFFSET + state.RF_LIMIT
        });
    }
    function getSortColumnName(){
        const columns = {
            key: "Number",
            Id: "Id",
            Name: "Name",
            Email: "Email",
            AccountId: "AccountId",
            Phone: "Phone"
        };
        return columns;
    }
    function onAccountModal(status = true){
        setState({
            type: "update",
            state: {
                editModal: false,
                accountModal: status
            }
        });
    }
    function onAccountModalSuccess(data){
        if(state.editModal){
            state.accounts.map((account, key) => {
                if(account.Id === data.Id){
                    state.accounts[key] = data;
                }
                return null;
            });
        }else{
            if(state.accounts === null){
                state.accounts = [];
            }
            state.accounts.push(data);
        }
        setState({
            type: "update",
            state: {
                editModal: false,
                accountModal: false,
                accounts: state.accounts,
                errorMessage: null
            }
        });
    }
    function onDeleteModalSuccess(){
        const { row } = state;
        const conn = getConnection();
        conn.sobject("Account").destroy(row.Id, function(err, ret) {
            if (err || !ret.success) {
                let errorMessage = err;
                if(typeof(err) === "object"){
                    errorMessage = err.message;
                }
                setState({type: "update", state: {
                    saving: false,
                    errorMessage: errorMessage
                }});
                return;
            }
            state.accounts.map((account, key) => {
                if(account.Id === row.Id){
                    state.accounts.splice(key, 1);
                }
                return null;
            });
            setState({
                type: "update",
                state: {
                    saving: false,
                    editModal: false,
                    accountModal: false,
                    deleteModal: false,
                    accounts: state.accounts,
                }
            });
        });

        setState({
            type: "update",
            state: {
                saving: true,
                errorMessage: null
            }
        });
    }
    function onConfirmationModal(status = true){
        setState({
            type: "update",
            state: {
                accountModal: false,
                deleteModal: status,
                errorMessage: null
            }
        });
    }
    // function onRefreshAccounts(){
    //     setAdapterState({
    //         loading: false,
    //         callApi: true
    //     });
    // }
    function getTableRowOptions(){
        const options = [
            {
                id: 0,
                label: 'Edit',
                value: 'edit',
            },
            {
                id: 1,
                label: 'Delete',
                value: 'delete',
            },
        ];
        return options;
    }
    const items = getItems();
    const actions = () => (
        <PageHeaderControl>
            <ButtonGroup id="button-group-page-header-actions">
                <Button label="New" onClick={() => onAccountModal()} />
            </ButtonGroup>
        </PageHeaderControl>
    );
    const controls = () => (
        <React.Fragment>
            <PageHeaderControl>
                <Input
                    assistiveText={{ label: "Find in List" }}
                    iconLeft={<InlineIcon category="utility" name="search" size="x-small" className="slds-input__icon_left slds-input__icon" />}
                    onChange={handleFilterChange}
                    placeholder="Search this list..."
                />
            </PageHeaderControl>
            {/* <PageHeaderControl>
                <Button
                    assistiveText={{ icon: 'Refresh' }}
                    iconVariant="border-filled"
                    variant="icon"
                    onClick={() => onRefreshAccounts()}
                >
                    <InlineIcon
                        category="utility"
                        name="refresh"
                        size="x-small"
                    />
                </Button>
            </PageHeaderControl> */}
        </React.Fragment>
    );
    // if(state.dataTableRef.current !== null){
    //     setTimeout(() => {
    //         state.dataTableRef.current.resizer.onResize();
    //     }, 100);
    // }
    const { sortColumn } = state;
    const sortColumns = getSortColumnName();
    return (
        <div className="slds-grid slds-grid_vertical slds-custom-table-container">
            <div
                className="table-container"
            >
                <PageHeader
                    onRenderActions={actions}
                    icon={
                        <InlineIcon
                            assistiveText={{ label: 'Accounts' }}
                            category="custom"
                            name="custom68"
                            size="medium"
                            iconClassName="slds-page-header__icon"
                        />
                    }
                    info={items.length+" items • sorted by "+sortColumns[sortColumn]}
                    joined
                    label="Jsforce Accounts sObject API Demo (MP)"
                    onRenderControls={controls}
                    className="table-main-heading card-details-header"
                    title={
                        <h1 className="slds-page-header__title slds-p-right_x-small">
                        </h1>
                    }
                    variant="object-home"
                />
            </div>
            <DataTable
                id="accounts-table"
                ref={state.dataTableRef}
                assistiveText={{
                    actionsHeader: 'actions',
                    columnSort: 'sort this column',
                    columnSortedAscending: 'asc',
                    columnSortedDescending: 'desc',
                    selectAllRows: 'Select all rows',
                    selectRow: 'Select this row',
                }}
                // fixedLayout
                // resizable
                resizableOptions={{
                    widths: ['50px', '200px'],
                    disabledColumns: [0]
                }}
                keyboardNavigation
                joined
                items={items}
                onRowChange={handleChanged}
                onSort={handleSort}
                onLoadMore={handleLoadMore}
                selection={state.selection}
                selectRows="checkbox"
                className={loading ? "slds-custom-table table_stencils" : "slds-custom-table"}
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
                    label="Name"
                    property="Name"
                    width="8rem"
                />
                <DataTableColumn
                    label="Phone"
                    property="Phone"
                    width="8rem"
                />
                <DataTableColumn
                    label="Website"
                    property="Website"
                    width="8rem"
                />
                <DataTableColumn
                    label="Created Date"
                    property="CreatedDate"
                    width="8rem"
                />
                <DataTableRowActions
                    options={getTableRowOptions()}
                    onAction={handleRowAction}
                    dropdown={<Dropdown length="7" showButtonIcon onClick={handleRowClick} />}
                />
            </DataTable>
            {
                state.accountModal ?
                    <Account
                        open={state.accountModal}
                        onCancel={() => onAccountModal(false)}
                        onSuccess={onAccountModalSuccess}
                    />
                :
                null
            }
            {
                state.editModal ?
                    <Account
                        open={state.editModal}
                        item={state.row}
                        onCancel={() => onAccountModal(false)}
                        onSuccess={onAccountModalSuccess}
                        onDelete={onDeleteModalSuccess}
                        onWorkerAction={(action) => handleRowAction(state.row, {value: action})}
                    />
                :
                null
            }
            {
                state.deleteModal ?
                    <Confirmation
                        open={state.deleteModal}
                        item={state.row}
                        onCancel={() => onConfirmationModal(false)}
                        onSuccess={onDeleteModalSuccess}
                        message={"Are you sure you want to delete?"}
                        saving={state.saving}
                        errorMessage={state.errorMessage}
                    />
                :
                null
            }
        </div>
    )
};

Jsforce.propTypes = {
    classes: PropTypes.object,
};

export default Jsforce;
