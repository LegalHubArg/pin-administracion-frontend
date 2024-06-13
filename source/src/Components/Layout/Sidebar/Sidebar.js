import React from "react";

import { FiGrid } from "react-icons/fi";

import { Nav, Button } from "react-bootstrap";
import classNames from "classnames";

class SideBar extends React.Component {
  render() {
    return (
      <div className={classNames("sidebar", { "is-open": this.props.isOpen })}>
        <div className="sidebar-header">
          <Button
            variant="link"
            onClick={this.props.toggle}
            style={{ color: "#fff" }}
            className="mt-4"
          >
            <FiGrid />
          </Button>
          <h3>react-bootstrap sidebar</h3>
        </div>

        <Nav className="flex-column pt-2">
          <p className="ml-3">Heading</p>

          <Nav.Item className="active">
            <Nav.Link href="/">
            <FiGrid />
              Home
            </Nav.Link>
          </Nav.Item>


          <Nav.Item>
            <Nav.Link href="/">
              <FiGrid />
              About
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link href="/">
            <FiGrid />
              Portfolio
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link href="/">
            <FiGrid />
              FAQ
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link href="/">
            <FiGrid />
              Contact
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    );
  }
}

export default SideBar;