import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'

export const NoResultsMessage = ({ additionalStyles }) => (
    <p
        id="no-std-report-find-message-id"
        style={{ textAlign: 'center', ...additionalStyles }}
    >
        {i18n.t('No results have been found')}
    </p>
)

NoResultsMessage.propTypes = {
    additionalStyles: PropTypes.object,
}

NoResultsMessage.defaultProps = {
    additionalStyles: {},
}