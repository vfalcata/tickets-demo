import Link from 'next/link';

const Header = ({currentUser})=>{
    //conditionally show or hide elements in a list
    const links = [
        !currentUser && {label: 'Sign Up', href: '/auth/signup'},
        !currentUser && {label: 'Sign In', href: '/auth/signin'},
        currentUser && {label:'Sell Tickets',href:'/tickets/new'},
        currentUser && {label: 'My Orders', href:'orders'},
        currentUser && {label: 'Sign Out', href: '/auth/signout'}
        // The logical operators in javasript can return non boolean values.
        // The Logical OR operator will return the first truthy value it finds in the operands.
        // The Logical AND will return the first falsy value, or the last operand if all other
        // operands are truhty.
    ]
        .filter(linkConfig => linkConfig) //filters all falsy enteries
        .map(({label, href})=>{
        return <li key={href} className="nav-item">
            <Link href={href}>
                <a className="nav-link">{label}</a>
            </Link>
        </li>
    })
    //there are two possibilities
    //[false, false, {label: 'Sign Out', href: '/auth/signout'}
    //or the opposite
    return <nav className="navbar navbar-light bg-light">
        <Link href="/">
            <a className="navbar-brand ">GitTix</a>
        </Link>
        <div className="d-flex justify-content-end">
            <ul className="nav d-flex align-items-center">
                {links}
            </ul>
        </div>
    </nav>
}

export default Header;