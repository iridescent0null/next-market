import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
    return (
        <header>
            <>
                <Link href="/">
                    <div className="banner-wrapper">
                        <Image src="/banner.svg" alt="" fill sizes="(max-width: 768px)" className="banner"/>
                    </div>
                </Link>
                <div className="right-button-wrapper">
                <Link href="/homepage">
                    <button className="cart-button">Cart</button>
                </Link>
                </div>
                <div className="note">
                    <h4>Note: </h4>
                    <div>this site is being personally built to learn TypeScript and Next, not to manage or present actual services.</div>
                </div>
            </>
        </header>
    )
};

export default Header;