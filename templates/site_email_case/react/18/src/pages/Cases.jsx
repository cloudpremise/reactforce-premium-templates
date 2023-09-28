import React from "react";
import Card from '@salesforce/design-system-react/components/card';
import Button from '@salesforce/design-system-react/components/button';
import Api from "../Api";
import Spinner from '@salesforce/design-system-react/components/spinner';
import stateReducer from "../hooks/stateReducer";
import CaseModal from "../components/Modals/CaseModal";

import DataTable from '../components/DataTable';
import DataTableCell from '@salesforce/design-system-react/components/data-table/cell';
import DataTableColumn from '@salesforce/design-system-react/components/data-table/column';
import DataTableInteractiveLink from '@salesforce/design-system-react/components/data-table/interactive-link';
import DataTableRowActions from '../components/DataTable/RowActions';
import Dropdown from '@salesforce/design-system-react/components/menu-dropdown';
import { useNavigate } from "react-router-dom";
import Confirmation from  "../components/Modals/Confirmation";
import { getParam } from "../ApexAdapter";

const CustomDataTableCell = ({ children, ...props }) => (
	<DataTableCell {...props}>
		<DataTableInteractiveLink
            onClick={(event) => {
                event.preventDefault();
                props.item.onClick(event);
            }}
		>
			{children}
		</DataTableInteractiveLink>
	</DataTableCell>
);
CustomDataTableCell.displayName = DataTableCell.displayName;

const Cases = (props) => {
    const secureLink = getParam("secureLink");
    let heading = "Enter Your Email Address to Continue";
    let loadingLinkInfo = false;
    let footer = "Unauthenticated Screen";
    if(typeof(secureLink) === "string" && secureLink.length > 0 && secureLink !== "null"){
        heading = "Please wait while we verify your secure link";
        loadingLinkInfo = true;
        footer = "Authenticated Screen";
    }
    let verifiedEntity = localStorage.getItem("verified_entity");
    if(verifiedEntity !== null){
        verifiedEntity = JSON.parse(verifiedEntity);
        heading = "You are recognized as "+verifiedEntity.firstName+" "+verifiedEntity.lastName+" with Id: "+verifiedEntity.id;
        footer = "Case Management Screen";
    }
    const [state, setState] = React.useReducer(stateReducer, {
        email: "",
        loading: loadingLinkInfo,
        errorMessage: null,
        heading: heading,
        loadCases: loadingLinkInfo,
        loadingLinkInfo: loadingLinkInfo,
        footer: footer,
        verifiedEntity: verifiedEntity,
        caseModal: false,
        editModal: false,
        caseRow: null,
        checkEmail: false,
        cases: [],
        closedCases: [],
        searchText: "",
        sortColumn: 'Id',
        sortColumnDirection: {
			Id: 'desc',
		},
        items: [],
        selection: [],
        linkExpired: false,
        closeModal: false
    });

    const navigate = useNavigate();
    React.useEffect(() => {
        if(state.linkExpired){
            window.history.replaceState(null, document.title, props.basename+"/login-link"+window.location.search);
            return navigate("/login-link", { replace: true });
        }
        if(!state.loadCases){
            return;
        }
        loadCases(false);
        loadCases(true);
    });

    function onNewCaseModal(status = true, caseRow = null){
        const cases = state.cases;
        let loadCases = false;
        if(caseRow !== null){
            cases.map((item, key) => {
                if(item.Id === caseRow.Id){
                    if(item.IsClosed !== caseRow.IsClosed){
                        loadCases = true;
                    }
                    cases[key] = caseRow;
                }
                return null;
            })
        }
        setState({
            type: "update",
            state: {
                caseModal: status,
                editModal: status,
                caseRow: null,
                cases: cases,
                loadCases: loadCases
            }
        });
    }
    function onNewCaseModalSuccess(caseRow){
        state.cases.push(caseRow);
        setState({
            type: "update",
            state: {
                caseModal: false,
                editModal: false,
                caseRow: null,
                cases: state.cases
            }
        });
    }
    function loadCases(isClosed = false){
        const key = localStorage.getItem("secure_link_key");
        const secureLink  = getParam("secureLink");
        const caseId = getParam("caseId");
        const requestData = {};
        let headers = {
            SECURE_KEY: key,
            SECURE_LINK: secureLink
        };
        let method = 'GET';
        let route = '/v1/public_case_access';
        const params = {
            isClosed: isClosed
        }

        Api.apexAdapter(params, route, method, requestData, headers).then((response) => {
            let result = [];
            if(response.numberOfResults > 0){
                result = response.result;
            }
            let casesStateKey = 'cases';
            if(isClosed){
                casesStateKey = 'closedCases';
            }
            let newState = {
                [casesStateKey]: result,
                loading: false
            };
            if(typeof(caseId) === "string" && caseId.length > 0 && caseId !== "null"){
                result.map((caseObj) => {
                    if(caseId === caseObj.Id){
                        newState['caseRow'] = caseObj;
                        newState['editModal'] = true;
                        let search = window.location.search.replace("caseId="+caseId+"&", "");
                        search = window.location.search.replace("caseId="+caseId, "");
                        window.history.replaceState(null, document.title, window.location.pathname+search);
                    }
                    return null;
                });
            }
            setState({
                type: "update",
                state: newState
            });
        }).catch(err => {
            setState({
                type: "update",
                state: {
                    linkExpired: true,
                }
            });
        });
        setState({
            type: "update",
            state: {
                loading: true,
                loadCases: false
            }
        });
    }
    function getItems(isClosed = false){
        let cases = state.cases;
        if(isClosed){
            cases = state.closedCases;
        }
        let items = [];
        if(state.loading){
            return items;
        }
        if(cases === null){
            return items;
        }
        if(state.searchText.length > 0){
            const filteredItems = cases.filter((item) =>
                RegExp(state.searchText, 'i').test(item.Subject)
            );
            filteredItems.map((caseObj, key) => {
                const itemObj = {
                    ...caseObj,
                    key: (key + 1),
                    id: caseObj.Id,
                };
                items.push({
                    ...itemObj,
                    onClick: () => { handleRowAction(itemObj, {value: "edit"}) }
                });
                return null;
            });
        }else{
            cases.map((caseObj, key) => {
                const itemObj = {
                    ...caseObj,
                    key: (key + 1),
                    id: caseObj.Id,
                };
                items.push({
                    ...itemObj,
                    onClick: () => { handleRowAction(itemObj, {value: "edit"}) }
                });
                return null;
            });
        }
        return items;
        
    }
    function handleChanged(event, data){
		setState({
            type: "update",
            state: {
                selection: data.selection
            }
        });
	}
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

        setState({
            type: "update",
            state: newState
        });
	}
    function handleRowAction(item, action){
        let newState = {
            [action.value+"Modal"]: true
        };
        if(item !== null){
            newState['caseRow'] = item;
        }
        setState({
            type: "update",
            state: newState
        });      
	}
    function getTableRowOptions(isClosed = false){
        const options = [
            {
                id: 0,
                label: (isClosed ? 'View' : 'Edit'),
                value: 'edit',
            }
        ];
        if(!isClosed){
            options.push({
                id: 1,
                label: 'Close Case',
                value: 'close',
            });
        }
        return options;
    }
    function handleRowClick(event, item){
        setState({
            type: "update",
            state: {
                caseRow: item
            }
        });
	}
    function renderCases(){
        const items = getItems();
        const closedItems = getItems(true);
        return (
            <div>
                <Button
                    onClick={() => onNewCaseModal()}
                >
                    New Case
                </Button>
                <DataTable
                    id="cases-table"
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
                    loading={state.loading}
                    selectRows="checkbox"
                    className={"slds-m-top_medium"}
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
                        label="Subject"
                        property="Subject"
                        width="8rem"
                    />
                    <DataTableColumn
                        label="Description"
                        property="Description"
                        width="8rem"
                    />
                    <DataTableRowActions
                        options={getTableRowOptions()}
                        onAction={handleRowAction}
                        dropdown={<Dropdown length="7" showButtonIcon onClick={handleRowClick} />}
                    />
                </DataTable>
                <h3 className="slds-m-top_large slds-m-bottom_large slds-text-heading_small">Closes Cases</h3>
                <DataTable
                    id="cases-table"
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
                    items={closedItems}
                    onRowChange={handleChanged}
                    onSort={handleSort}
                    selection={state.selection}
                    loading={state.loading}
                    selectRows="checkbox"
                    className={"slds-m-top_medium"}
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
                        label="Subject"
                        property="Subject"
                        width="8rem"
                    />
                    <DataTableColumn
                        label="Description"
                        property="Description"
                        width="8rem"
                    />
                    <DataTableRowActions
                        options={getTableRowOptions(true)}
                        onAction={handleRowAction}
                        dropdown={<Dropdown length="7" showButtonIcon onClick={handleRowClick} />}
                    />
                </DataTable>
            </div>
        )
    }
    function onConfirmationModal(status = false){
        setState({
            type: "update",
            state: {
                closeModal: status
            }
        });
    }
    function onCloseModalSuccess(){
        const { caseRow, loading } = state;
        if(caseRow === null && loading){
            return;
        }
        const key = localStorage.getItem("secure_link_key");
        const secureLink  = getParam("secureLink");
        const requestData = {};
        let headers = {
            SECURE_KEY: key,
            SECURE_LINK: secureLink
        };
        let method = 'PATCH';
        let route = '/v1/public_case_access/'+caseRow.Id+'/close';
        Api.apexAdapter({}, route, method, requestData, headers).then((response) => {
            const result = response.result;
            onNewCaseModal(false, result);
        }).catch(err => {
            setState({type: "update", state: {
                loading: false,
                closeModal: false
            }});
        });

        setState({type: "update", state: {
            loading: true,
            closeModal: false
        }});
    }
    return (
        <div className="slds-m-around_medium">
            <div className="slds-grid slds-wrap slds-grid_align-center">
                <form className={"slds-size_4-of-"+(state.verifiedEntity !== null ? "6" : "12")}>
                    <Card
                        heading={state.heading}
                        footer={(state.loadingLinkInfo ? null : state.footer)}
                    >
                        <div className="slds-p-around_medium">
                            {
                                (state.verifiedEntity !== null && !state.loading) ?
                                    renderCases()
                                :
                                (state.loadingLinkInfo || state.loading) ?
                                    <div key="spinner" className="slds-is-relative slds-m-top_large" style={{height: "45px"}}>
                                        <Spinner
                                            assistiveText={{ label: "Loading ..." }}
                                            hasContainer={false}
                                            size="large"
                                            variant="brand"
                                            isInline
                                        />
                                    </div>
                                :
                                <>
                                    {
                                        state.errorMessage !== null ?
                                            <p className="slds-m-top_medium slds-text-color_destructive">{state.errorMessage}</p>
                                        :
                                            null
                                    }
                                    {
                                        state.verifiedEntity === null ?
                                            state.loading ?
                                                <div key="spinner" className="slds-is-relative slds-m-top_large" style={{height: "45px"}}>
                                                    <Spinner
                                                        assistiveText={{ label: "Loading ..." }}
                                                        hasContainer={false}
                                                        size="large"
                                                        variant="brand"
                                                        isInline
                                                    />
                                                </div>
                                            :
                                            null
                                        :
                                        null
                                    }
                                </>
                            }
                        </div>
                    </Card>
                </form>
            </div>
            {
                (state.caseModal || state.editModal) ?
                    <CaseModal
                        open={(state.caseModal || state.editModal)}
                        item={state.caseRow}
                        onCancel={(caseRow) => onNewCaseModal(false, caseRow)}
                        onSuccess={(caseRow) => onNewCaseModalSuccess(caseRow)}
                        verifiedEntity={state.verifiedEntity}
                    />
                :
                null
            }
            {
                state.closeModal ?
                    <Confirmation
                        open={state.closeModal}
                        item={state.caseRow}
                        onCancel={() => onConfirmationModal(false)}
                        onSuccess={onCloseModalSuccess}
                        message={"Are you sure you want to close this case?"}
                        saving={state.saving}
                        errorMessage={state.errorMessage}
                    />
                :
                null
            }
        </div>
    )
};

export default Cases;