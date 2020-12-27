import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';

class Settings extends Component {

  render() {

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Settings
              </CardHeader>
              <CardBody>
                <span className="h4">TODO</span>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Settings;