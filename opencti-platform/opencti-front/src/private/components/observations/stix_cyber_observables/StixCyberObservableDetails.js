import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  compose, dissoc, pipe, map, toPairs, filter, includes,
} from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import inject18n from '../../../../components/i18n';
import StixCyberObservableLinks, {
  stixCyberObservableLinksQuery,
} from './StixCyberObservableLinks';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import { ignoredAttributes } from './StixCyberObservableCreation';
import { QueryRenderer } from '../../../../relay/environment';

const styles = () => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
});

class StixCyberObservableDetailsComponent extends Component {
  render() {
    const { t, classes, stixCyberObservable } = this.props;
    const observableAttributes = pipe(
      dissoc('id'),
      dissoc('entity_type'),
      toPairs,
      map((n) => ({ key: n[0], value: n[1] })),
      filter((n) => n.value && !includes(n.key, ignoredAttributes)),
    )(stixCyberObservable);
    const paginationOptions = {
      elementId: stixCyberObservable.id,
      orderBy: 'created_at',
      orderMode: 'desc',
    };
    return (
      <div style={{ height: '100%' }} className="break">
        <Typography variant="h4" gutterBottom={true}>
          {t('Details')}
        </Typography>
        <Paper classes={{ root: classes.paper }} elevation={2}>
          <Grid container={true} spacing={3} style={{ marginBottom: 10 }}>
            <Grid item={true} xs={6}>
              <Typography variant="h3" gutterBottom={true}>
                {t('Description')}
              </Typography>
              <ExpandableMarkdown
                source={stixCyberObservable.x_opencti_description}
                limit={400}
              />
            </Grid>
            {observableAttributes.map((observableAttribute) => {
              if (observableAttribute.key === 'hashes') {
                return observableAttribute.value.map((hash) => (
                  <Grid key={hash.algorithm} item={true} xs={6}>
                    <Typography variant="h3" gutterBottom={true}>
                      {hash.algorithm}
                    </Typography>
                    <pre>{hash.hash}</pre>
                  </Grid>
                ));
              }
              let finalValue = observableAttribute.value;
              if (finalValue === true) {
                finalValue = 'TRUE';
              } else if (finalValue === false) {
                finalValue = 'FALSE';
              }
              return (
                <Grid key={observableAttribute.key} item={true} xs={6}>
                  <Typography variant="h3" gutterBottom={true}>
                    {observableAttribute.key.replace('attribute_', '')}
                  </Typography>
                  <pre>{finalValue || '-'}</pre>
                </Grid>
              );
            })}
          </Grid>
          <QueryRenderer
            query={stixCyberObservableLinksQuery}
            variables={{ count: 25, ...paginationOptions }}
            render={({ props }) => (
              <StixCyberObservableLinks
                stixCyberObservableId={stixCyberObservable.id}
                stixCyberObservableType={stixCyberObservable.entity_type}
                paginationOptions={paginationOptions}
                data={props}
              />
            )}
          />
        </Paper>
      </div>
    );
  }
}

StixCyberObservableDetailsComponent.propTypes = {
  stixCyberObservable: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const StixCyberObservableDetails = createFragmentContainer(
  StixCyberObservableDetailsComponent,
  {
    stixCyberObservable: graphql`
      fragment StixCyberObservableDetails_stixCyberObservable on StixCyberObservable {
        id
        entity_type
        x_opencti_score
        x_opencti_description
        observable_value
        ... on AutonomousSystem {
          number
          name
          rir
        }
        ... on Directory {
          path
          path_enc
          ctime
          mtime
          atime
        }
        ... on DomainName {
          value
        }
        ... on EmailAddr {
          value
          display_name
        }
        ... on EmailMessage {
          is_multipart
          attribute_date
          content_type
          message_id
          subject
          received_lines
          body
        }
        ... on Artifact {
          mime_type
          payload_bin
          url
          encryption_algorithm
          decryption_key
          hashes {
            algorithm
            hash
          }
        }
        ... on StixFile {
          extensions
          size
          name
          name_enc
          magic_number_hex
          mime_type
          ctime
          mtime
          atime
          hashes {
            algorithm
            hash
          }
        }
        ... on X509Certificate {
          is_self_signed
          version
          serial_number
          signature_algorithm
          issuer
          validity_not_before
          validity_not_after
          hashes {
            algorithm
            hash
          }
        }
        ... on IPv4Addr {
          value
        }
        ... on IPv6Addr {
          value
        }
        ... on MacAddr {
          value
        }
        ... on Mutex {
          name
        }
        ... on NetworkTraffic {
          extensions
          start
          end
          is_active
          src_port
          dst_port
          protocols
          src_byte_count
          dst_byte_count
          src_packets
          dst_packets
        }
        ... on Process {
          extensions
          is_hidden
          pid
          created_time
          cwd
          command_line
          environment_variables
        }
        ... on Software {
          name
          cpe
          swid
          languages
          vendor
          version
        }
        ... on Url {
          value
        }
        ... on UserAccount {
          extensions
          user_id
          credential
          account_login
          account_type
          display_name
          is_service_account
          is_privileged
          can_escalate_privs
          is_disabled
          account_created
          account_expires
          credential_last_changed
          account_first_login
          account_last_login
        }
        ... on WindowsRegistryKey {
          attribute_key
          modified_time
          number_of_subkeys
        }
        ... on WindowsRegistryValueType {
          name
          data
          data_type
        }
        ... on X509V3ExtensionsType {
          basic_constraints
          name_constraints
          policy_constraints
          key_usage
          extended_key_usage
          subject_key_identifier
          authority_key_identifier
          subject_alternative_name
          issuer_alternative_name
          subject_directory_attributes
          crl_distribution_points
          inhibit_any_policy
          private_key_usage_period_not_before
          private_key_usage_period_not_after
          certificate_policies
          policy_mappings
        }
        ... on XOpenCTICryptographicKey {
          value
        }
        ... on XOpenCTICryptocurrencyWallet {
          value
        }
        ... on XOpenCTIText {
          value
        }
        ... on XOpenCTIUserAgent {
          value
        }
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservableDetails);
