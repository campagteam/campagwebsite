function sendMail() {
    let params = {
        name: document.getElementById("demo-name").value,
        email: document.getElementById("demo-email").value,
        message: document.getElementById("demo-message").value,
    };

    emailjs.send("service_0f734hc", "template_fzlymrv", params)
        .then(function(response) {
            document.getElementById('notification').innerHTML = '<p>Form Submitted</p>';
            document.getElementById('notification').style.display = 'block';
            document.getElementById('notification').style.color = 'green';
        })
        .catch(function(error) {
            document.getElementById('notification').innerHTML = '<p>Failed to send email. Please try again.</p>';
            document.getElementById('notification').style.display = 'block';
            document.getElementById('notification').style.color = 'red';
        });
}
function sendMail2() {
    let params = {
        name: document.getElementById("demo-name").value,
        email: document.getElementById("demo-email").value,
        message: document.getElementById("demo-message").value,
    };

    emailjs.send("service_0f734hc", "template_3h1i278", params)
        .then(function(response) {
            document.getElementById('notification').innerHTML = '<p>Form Submitted</p>';
            document.getElementById('notification').style.display = 'block';
            document.getElementById('notification').style.color = 'green';
        })
        .catch(function(error) {
            document.getElementById('notification').innerHTML = '<p>Failed to send email. Please try again.</p>';
            document.getElementById('notification').style.display = 'block';
            document.getElementById('notification').style.color = 'red';
        });
}



function toggleAnswer(element) {
    const faqItem = element.parentElement;
    faqItem.classList.toggle('active');
}
