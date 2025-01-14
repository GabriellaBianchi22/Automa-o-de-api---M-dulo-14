/// <reference types="cypress"/>

import dayjs from "dayjs"

describe('Should test at a functional level', () => {

    //let token
    before(() => {
        cy.getToken('teste@gabianchi.com.br', 'gabianchi')
            // .then(tkn => {
            //     token = tkn
            // })

    })

    beforeEach(() => {
        cy.resetRest()

    })

    it('Should create an account', () => {
        cy.request({
            method: 'POST',
            url: '/contas',
           // headers: { Authorization: `JWT ${token}` },
            body: {
                nome: 'Conta via REST'
            }
        }).as('response')

        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(201)
            expect(res.body).to.have.property('id')
            expect(res.body).to.have.property('nome', 'Conta via REST')
        })
    })

    it('Should update an account', () => {
        cy.getAccountByName('Conta para alterar')
            // cy.request({
            //     method: 'GET',
            //     url: 'contas/',
            //    // headers: { Authorization: `JWT ${token}` },
            //     qs: {
            //         nome: 'Conta para alterar'
            //     }
            // })
            .then(contaId => {
                cy.request({
                    method: 'PUT',
                    url: `/contas/${contaId}`,
                   // headers: { Authorization: `JWT ${token}` },
                    body: {
                        nome: 'Conta alterada vis REST'
                    }
                }).as('response')
            })

        cy.get('@response').its('status').should('be.equal', 200)
    })

    it('Should not create an account with same name', () => {
        cy.request({
            method: 'POST',
            url: '/contas',
           // headers: { Authorization: `JWT ${token}` },
            body: {
                nome: 'Conta mesmo nome'
            },
            failOnStatusCode: false
        }).as('response')

        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(400)
            expect(res.body.error).to.be.equal('Já existe uma conta com esse nome!')
        })
    })

    it('Should create a transaction', () => {
        cy.getAccountByName('Conta para movimentacoes')
            .then(contaId => {
                cy.request({
                    method: 'POST',
                    url: '/transacoes',
                   // headers: { Authorization: `JWT ${token}` },
                    body: {
                        conta_id: contaId,
                        data_pagamento: dayjs().add(2, 'days').format('DD/MM/YYYY'),
                        data_transacao: dayjs().format('DD/MM/YYYY'),
                        descricao: "desc",
                        envolvido: "int",
                        status: true,
                        tipo: "REC",
                        valor: "1100"
                    }
                }).as('response')

                cy.get('@response').its('status').should('be.equal', 201)
                cy.get('@response').its('body.id').should('exist')
            })
    })

    it('Should get a balance', () => {
        cy.request({
            method: 'GET',
            url: '/saldo',
           // headers: { Authorization: `JWT ${token}` },
        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('534.00')
        })

        cy.request({
            method: 'GET',
            url: '/transacoes',
            qs: {
                descricao: 'Movimentacao 1, calculo saldo'
            },
           // headers: { Authorization: `JWT ${token}` },
        }).then(res => {
            cy.request({
                method: 'PUT',
                url: `/transacoes/${res.body[0].id}`,
               // headers: { Authorization: `JWT ${token}` },
                body: {
                    status: true,
                    data_transacao: dayjs(res.body[0].data_transacao).format('DD/MM/YYYY'),
                    data_pagamento: dayjs(res.body[0].data_pagamento).format('DD/MM/YYYY'),
                    descricao: res.body[0].descricao,
                    envolvido: res.body[0].envolvido,
                    valor: res.body[0].valor,
                    conta_id: res.body[0].conta_id,
                }
            }).its('status').should('be.equal', 200)

            console.log(res.body[0])


        })
        cy.request({
            method: 'GET',
            url: '/saldo',
           // headers: { Authorization: `JWT ${token}` },
        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('4034.00')
        })

    })

    it('Should remove a transaction', () => {
        cy.request({
            method: 'GET',
            url: '/transacoes',
            qs: {
                descricao: 'Movimentacao para exclusao'
            },
           // headers: { Authorization: `JWT ${token}` },
        }).then(res => {
            cy.request({
                method: 'DELETE',
                url: `/transacoes/${res.body[0].id}`,
               // headers: { Authorization: `JWT ${token}` },
            }).its('status').should('be.equal', 204)
        })

    })

});