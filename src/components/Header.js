import React from "react";
import Logo from "../asset/logo.svg";
import { Link } from "react-router-dom";

function Header(props) {

  const { address, isConnected, connect } = props;
  return (
    <header>
      <div className="leftH">
        <Link to="/">

          <img src={Logo} alt="logo" className="logo" />
        </Link>
        {isConnected && (
          <Link to="/swap" className="link">
            <div className="headerItem">Swap</div>
          </Link>)}
          {isConnected && (
          <Link to="/mint" className="link">
            <div className="headerItem">Mint</div>
          </Link>)}
          {isConnected && (
          <Link to="/create" className="link">
            <div className="headerItem">Create</div>
          </Link>)}
      </div>
      <div className="rightH">
        <div className="connectButton" onClick={connect}>
          {isConnected ? (
            <>
              <span className="circle"></span>
              {address.address.slice(0, 6) + "..." + address.address.slice(55)}
            </>
          ) : "Connect"}
        </div>
      </div>
    </header>
  );
}

export default Header;
