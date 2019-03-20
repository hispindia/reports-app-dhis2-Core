import React from 'react'
import PropTypes from 'prop-types'
import FormHelperText from '@material-ui/core/FormHelperText'
import Button from '@material-ui/core/Button'
import i18n from '@dhis2/d2-i18n'
import { getApi } from '../../../utils/api'
import { reportTypes, REPORTS_ENDPOINT } from '../standard.report.conf'

export const DesignFileDownloadButton = ({
    isEditing,
    reportType,
    reportId,
}) => {
    let url
    let label
    const api = getApi()
    const type = reportType === reportTypes.HTML ? 'html' : 'jasper'

    if (isEditing) {
        label = i18n.t('Get current design')
        url = `${api.baseUrl}/${REPORTS_ENDPOINT}/${reportId}/design`
    } else {
        label =
            reportType === reportTypes.HTML
                ? i18n.t('Get HTML Report Template')
                : i18n.t('Get Jasper Report Template')
        url = `${api.baseUrl}/${REPORTS_ENDPOINT}/templates/${type}`
    }

    return (
        <div>
            <FormHelperText>{label}</FormHelperText>
            <FormHelperText>
                <Button variant="contained" component="span">
                    <a
                        href={url}
                        target="_blank"
                        style={{
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Download
                    </a>
                </Button>
            </FormHelperText>
            <FormHelperText />
        </div>
    )
}

DesignFileDownloadButton.propTypes = {
    isEditing: PropTypes.bool.isRequired,
    reportType: PropTypes.string.isRequired,
    reportId: PropTypes.string.isRequired,
}