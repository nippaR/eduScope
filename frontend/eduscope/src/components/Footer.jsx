import React from 'react';


const Footer = () => {
    return (
        <footer className="w-full py-4">
            <div className="container mx-auto text-center">
                <hr className="mb-4 border-gray-300" />
                <p>&copy; {new Date().getFullYear()} EduScope. All rights reserved.</p>
            </div>
        </footer>

    );
}

export default Footer;
