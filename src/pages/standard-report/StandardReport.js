/* React */
import React from 'react';
import PropTypes from 'prop-types';

/* material ui */
import { Paper } from 'material-ui';

/* d2-ui */
import Table from '@dhis2/d2-ui-table';
import SharingDialog from '@dhis2/d2-ui-sharing-dialog';
import { Button, Pagination, SvgIcon, InputField } from '@dhis2/d2-ui-core';

/* d2-ui styles */
import '@dhis2/d2-ui-core/build/css/Table.css';
import '@dhis2/d2-ui-core/build/css/Pagination.css';

/* Redux */
import { connect } from 'react-redux';
import { updateFeedbackState } from '../../actions/feedback';

/* styles */
import styles from './StandardReport.style';
import appStyles from '../../styles';

/* app components */
import Page from '../Page';
import PageHelper from '../../components/page-helper/PageHelper';
import { ConnectedAddEditStdReport } from './add-edit-report/AddEditStdReport';
import CreateStdReport from './create-report/CreateStdReport';
import HtmlReport from './HtmlReport';

/* app config */
import {
    ADD_NEW_REPORT_ACTION, CONTEXT_MENU_ACTION, CONTEXT_MENU_ICONS, REPORTS_ENDPOINT } from './standard.report.conf';
import { DEBOUNCE_DELAY } from '../sections.conf';

/* utils */
import { getDocsUrl } from '../../helpers/docs';
import { calculatePageValue, INITIAL_PAGER } from '../../helpers/pagination';
import { ACTION_MESSAGE, LOADING, SUCCESS } from '../../helpers/feedbackSnackBarTypes';

/* i18n */
import i18n from '../../locales';
import { i18nKeys } from '../../i18n';

export default class StandardReport extends Page {
    static propTypes = {
        showSnackbar: PropTypes.bool,
        snackbarConf: PropTypes.object,
    };

    static defaultProps = {
        showSnackbar: false,
        snackbarConf: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            pager: INITIAL_PAGER,
            reports: [],
            selectedReport: null,
            selectedAction: null,
            search: '',
            open: false,
            htmlReport: null,
            timeoutId: null,
        };

        this.search = this.search.bind(this);
        this.debounceSearch = this.debounceSearch.bind(this);
        this.addNewReport = this.addNewReport.bind(this);

        /* Pagination */
        this.hasNextPage = this.hasNextPage.bind(this);
        this.hasPreviousPage = this.hasPreviousPage.bind(this);
        this.onNextPageClick = this.onNextPageClick.bind(this);
        this.onPreviousPageClick = this.onPreviousPageClick.bind(this);

        /* Context Menu */
        this.createReport = this.createReport.bind(this);
        this.editReport = this.editReport.bind(this);
        this.sharingSettings = this.sharingSettings.bind(this);
        this.delete = this.delete.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleDisplayHtmlReport = this.handleDisplayHtmlReport.bind(this);
    }

    getChildContext() {
        return { d2: this.props.d2 };
    }

    componentDidMount() {
        super.componentDidMount();
        this.loadData(INITIAL_PAGER);
    }

    componentWillUnmount() {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
    }

    loadData(pager, search) {
        const api = this.props.d2.Api.getApi();
        let url = `${REPORTS_ENDPOINT}?page=${pager.page}&pageSize=${pager.pageSize}` +
        '&fields=displayName,type,id,reportTable[id,displayName]';
        this.setState({ search });
        if (search) {
            url = `${url}&filter=displayName:ilike:${search}`;
        }
        if (api) {
            this.props.updateFeedbackState(true, { type: LOADING });
            api.get(url).then((response) => {
                if (response && this.isPageMounted()) {
                    if (this.state.deleteInProgress) {
                        this.props.updateFeedbackState(
                            true,
                            {
                                type: SUCCESS,
                                message: i18n.t(i18nKeys.messages.reportDeleted),
                            },
                        );
                    } else {
                        this.props.updateFeedbackState(false);
                    }
                    this.setState(response);
                }
            }).catch((error) => {
                this.manageError(error);
            }).finally(() => {
                this.state.deleteInProgress = false;
            });
        }
    }

    /* Pagination */
    hasNextPage() {
        return this.state.pager.page < this.state.pager.pageCount;
    }

    hasPreviousPage() {
        return this.state.pager.page > 1;
    }

    onNextPageClick() {
        const pager = Object.assign({}, this.state.pager);
        pager.page += 1;
        this.loadData(pager, this.state.search);
    }

    onPreviousPageClick() {
        const pager = Object.assign({}, this.state.pager);
        pager.page -= 1;
        this.loadData(pager, this.state.search);
    }

    /* Search */
    search(field, value) {
        // ...and not empty search
        if (this.state.search !== value && /\S/.test(value)) {
            this.loadData(INITIAL_PAGER, value);
        } else if (this.state.search !== value) {
            this.loadData(INITIAL_PAGER);
        }
    }

    debounceSearch(field, lastSearch) {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
        this.state.timeoutId = setTimeout(() => { this.search(field, lastSearch); }, DEBOUNCE_DELAY);
        this.setState({ lastSearch });
    }

    /* Add new Report */
    addNewReport() {
        this.setState({ open: true, selectedAction: ADD_NEW_REPORT_ACTION });
    }

    handleClose(refreshList) {
        this.setState({ open: false, selectedReport: null });
        if (refreshList === true) {
            this.loadData(INITIAL_PAGER);
        }
    }

    handleError = (error) => {
        this.manageError(error);
    };

    handleDisplayHtmlReport(htmlReport) {
        this.setState({ htmlReport, open: false, selectedReport: null });
    }

    goBack = () => { this.setState({ htmlReport: null }); };

    /* Context Menu */
    createReport(args) {
        this.setState({ open: true, selectedReport: args, selectedAction: CONTEXT_MENU_ACTION.CREATE });
    }

    editReport(args) {
        this.setState({ open: true, selectedReport: args, selectedAction: CONTEXT_MENU_ACTION.EDIT });
    }

    sharingSettings(args) {
        this.setState({ open: true, selectedReport: args, selectedAction: CONTEXT_MENU_ACTION.SHARING_SETTINGS });
    }

    delete(args) {
        this.props.updateFeedbackState(true, {
            type: ACTION_MESSAGE,
            message: args.displayName,
            action: i18n.t(i18nKeys.messages.confirmDelete),
            onActionClick: () => {
                const api = this.props.d2.Api.getApi();
                const url = `${REPORTS_ENDPOINT}/${args.id}`;
                this.state.deleteInProgress = true;
                this.props.updateFeedbackState(false);
                api.delete(url).then((response) => {
                    if (response && this.isPageMounted()) {
                        this.loadData(INITIAL_PAGER, this.state.search);
                    }
                }).catch((error) => {
                    this.manageError(error);
                });
            },
        });
    }

    getCreateStdReportComponent() {
        return this.state.selectedReport ? (
            <CreateStdReport
                selectedReport={this.state.selectedReport}
                open={this.state.open}
                onRequestClose={this.handleClose}
                onGetHtmlReport={this.handleDisplayHtmlReport}
                d2={this.props.d2}
                onError={this.handleError}
            />
        ) : '';
    }

    getSharingDialog() {
        return this.state.selectedReport ? (
            <SharingDialog
                open={this.state.open}
                id={this.state.selectedReport.id}
                type={'report'}
                onRequestClose={this.handleClose}
                d2={this.props.d2}
            />
        ) : '';
    }

    getEditComponent() {
        return (
            <ConnectedAddEditStdReport
                selectedReport={this.state.selectedReport}
                open={this.state.open}
                onRequestClose={this.handleClose}
                d2={this.props.d2}
                onError={this.handleError}
            />
        );
    }

    getAddComponent() {
        return (
            <ConnectedAddEditStdReport
                open={this.state.open}
                onRequestClose={this.handleClose}
                d2={this.props.d2}
                onError={this.handleError}
            />
        );
    }

    getActionComponent() {
        switch (this.state.selectedAction) {
        case CONTEXT_MENU_ACTION.CREATE:
            return this.getCreateStdReportComponent();
        case CONTEXT_MENU_ACTION.SHARING_SETTINGS:
            return this.getSharingDialog();
        case CONTEXT_MENU_ACTION.EDIT:
            return this.getEditComponent();
        case ADD_NEW_REPORT_ACTION:
            return this.getAddComponent();
        default:
            return '';
        }
    }

    displayNoResults = () => (
        (this.state.reports.length > 0 || this.props.snackbarConf.type === LOADING) ? { display: 'none' } : ''
    );

    render() {
        // TODO: Check permissions
        const contextMenuOptions = {
            createReport: this.createReport,
            editReport: this.editReport,
            sharingSettings: this.sharingSettings,
            delete: this.delete,
        };

        return (
            <div>
                <h1>
                    { this.state.htmlReport &&
                    <span
                        id="back-button"
                        style={styles.backButton}
                        className="material-icons"
                        role="button"
                        tabIndex="0"
                        onClick={this.goBack}
                    >
                        arrow_back
                    </span>
                    }
                    { i18n.t(i18nKeys.standardReport.homeLabel) }
                    <PageHelper
                        url={getDocsUrl(this.props.d2.system.version, this.props.sectionKey)}
                    />
                </h1>
                <div id="std-report-content" style={{ display: this.state.htmlReport ? 'none' : 'block' }} >
                    <Pagination
                        total={this.state.pager.total}
                        hasNextPage={this.hasNextPage}
                        hasPreviousPage={this.hasPreviousPage}
                        onNextPageClick={this.onNextPageClick}
                        onPreviousPageClick={this.onPreviousPageClick}
                        currentlyShown={calculatePageValue(this.state.pager)}
                    />
                    <div id={'search-box-id'} style={styles.searchContainer}>
                        <InputField
                            id={'search-std-report-id'}
                            value={this.state.lastSearch || ''}
                            type="text"
                            hintText={i18n.t(i18nKeys.standardReport.search)}
                            // eslint-disable-next-line
                            onChange={value => this.debounceSearch('search', value)}
                        />
                    </div>
                    <Table
                        columns={['displayName', 'reportTable', 'id']}
                        rows={this.state.reports}
                        contextMenuActions={contextMenuOptions}
                        contextMenuIcons={CONTEXT_MENU_ICONS}
                    />
                    <p
                        id={'no-std-report-find-message-id'}
                        style={{ textAlign: 'center', ...(this.displayNoResults()) }}
                    >
                        {i18n.t(i18nKeys.messages.noResultsFound)}
                    </p>
                    <div id={'footer-pagination-id'} style={appStyles.marginForAddButton}>
                        <Pagination
                            total={this.state.pager.total}
                            hasNextPage={this.hasNextPage}
                            hasPreviousPage={this.hasPreviousPage}
                            onNextPageClick={this.onNextPageClick}
                            onPreviousPageClick={this.onPreviousPageClick}
                            currentlyShown={calculatePageValue(this.state.pager)}
                        />
                    </div>
                    <Button id={'add-std-report-btn-id'} fab onClick={this.addNewReport} style={appStyles.addButton}>
                        <SvgIcon icon={'Add'} />
                    </Button>
                    { this.getActionComponent() }
                </div>
                <Paper
                    style={{
                        display: this.state.htmlReport ? 'flex' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <HtmlReport html={this.state.htmlReport} />
                </Paper>
            </div>
        );
    }
}

StandardReport.childContextTypes = {
    d2: PropTypes.object,
};

const mapDispatchToProps = dispatch => ({
    updateFeedbackState: updateFeedbackState(dispatch),
});

export const ConnectedStandardReport = connect(
    null,
    mapDispatchToProps,
)(StandardReport);
